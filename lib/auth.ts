// Auth helpers — bsky.social supports CORS (access-control-allow-origin: *),
// so BskyAgent can be called directly from the browser without a proxy.

import { BskyAgent } from "@atproto/api";

const SESSION_KEY = "shared-shelf-session";

export interface ShelfSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

let _agent: BskyAgent | null = null;

export function getAgent(): BskyAgent {
  if (!_agent) {
    _agent = new BskyAgent({ service: "https://bsky.social" });
  }
  return _agent;
}

// ─── Login — direct browser → bsky.social (CORS allowed) ─────

export async function login(
  identifier: string,
  password: string
): Promise<ShelfSession> {
  const agent = new BskyAgent({ service: "https://bsky.social" });

  // agent.login() calls com.atproto.server.createSession
  const result = await agent.login({ identifier, password });
  _agent = agent;

  const session: ShelfSession = {
    did: result.data.did,
    handle: result.data.handle,
    accessJwt: result.data.accessJwt,
    refreshJwt: result.data.refreshJwt,
  };
  saveSession(session);
  return session;
}

// ─── Resume stored session ────────────────────────────────────

export async function resumeSession(
  session: ShelfSession
): Promise<ShelfSession | null> {
  try {
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      active: true,
    });
    _agent = agent;

    const updated: ShelfSession = {
      did: agent.session!.did,
      handle: agent.session!.handle,
      accessJwt: agent.session!.accessJwt,
      refreshJwt: agent.session!.refreshJwt,
    };
    saveSession(updated);
    return updated;
  } catch {
    clearSession();
    return null;
  }
}

// ─── localStorage persistence ─────────────────────────────────

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
