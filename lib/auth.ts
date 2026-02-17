// Auth helpers — login/refresh go through our API proxy routes to avoid CORS.
// PDS reads/writes use @atproto/api BskyAgent with the stored JWT directly.

import { BskyAgent } from "@atproto/api";

const SESSION_KEY = "shared-shelf-session";

export interface ShelfSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

// Module-level agent — re-used for PDS reads/writes after login
let _agent: BskyAgent | null = null;

export function getAgent(): BskyAgent {
  if (!_agent) {
    _agent = new BskyAgent({ service: "https://bsky.social" });
  }
  return _agent;
}

// Restore the agent's session from stored tokens so PDS calls work
function restoreAgentSession(session: ShelfSession) {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  // Directly set the session on the agent without a network call
  (agent as unknown as { session: unknown }).session = {
    did: session.did,
    handle: session.handle,
    accessJwt: session.accessJwt,
    refreshJwt: session.refreshJwt,
    active: true,
  };
  _agent = agent;
}

// ─── Login (proxied through /api/auth/login to avoid CORS) ───

export async function login(
  identifier: string,
  password: string
): Promise<ShelfSession> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  const session: ShelfSession = {
    did: data.did,
    handle: data.handle,
    accessJwt: data.accessJwt,
    refreshJwt: data.refreshJwt,
  };

  saveSession(session);
  restoreAgentSession(session);
  return session;
}

// ─── Resume session from localStorage ────────────────────────

export async function resumeSession(
  session: ShelfSession
): Promise<ShelfSession | null> {
  try {
    // Try to refresh the access token via our proxy
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshJwt: session.refreshJwt }),
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json();
    const updated: ShelfSession = {
      did: data.did,
      handle: data.handle,
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
    };

    saveSession(updated);
    restoreAgentSession(updated);
    return updated;
  } catch {
    clearSession();
    return null;
  }
}

// ─── Session persistence (localStorage) ──────────────────────

export function loadSession(): ShelfSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShelfSession;
  } catch {
    return null;
  }
}

export function saveSession(session: ShelfSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  _agent = null;
}
