// Auth helpers using raw fetch — bypasses @atproto/api bundling issues.
// bsky.social supports CORS (access-control-allow-origin: *) so all calls
// can be made directly from the browser.

const PDS = "https://bsky.social/xrpc";
const SESSION_KEY = "shared-shelf-session";

export interface ShelfSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

// ─── Raw XRPC helper ─────────────────────────────────────────

async function xrpc(
  endpoint: string,
  options: {
    method?: "GET" | "POST";
    auth?: string;
    body?: unknown;
  } = {}
): Promise<unknown> {
  const { method = "POST", auth, body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) headers["Authorization"] = `Bearer ${auth}`;

  const res = await fetch(`${PDS}/${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  // Attempt JSON parse — surface a useful error if the body is empty/malformed
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Unexpected response from Bluesky (status ${res.status}): ${text.slice(0, 120)}`
      );
    }
  }

  if (!res.ok) {
    const msg = String(data.message || data.error || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return data;
}

// ─── Login ───────────────────────────────────────────────────

export async function login(
  identifier: string,
  password: string
): Promise<ShelfSession> {
  const data = (await xrpc("com.atproto.server.createSession", {
    body: { identifier, password },
  })) as Record<string, unknown>;

  const session: ShelfSession = {
    did: String(data.did),
    handle: String(data.handle),
    accessJwt: String(data.accessJwt),
    refreshJwt: String(data.refreshJwt),
  };
  saveSession(session);
  return session;
}

// ─── Refresh stored session ───────────────────────────────────

export async function resumeSession(
  session: ShelfSession
): Promise<ShelfSession | null> {
  try {
    const data = (await xrpc("com.atproto.server.refreshSession", {
      auth: session.refreshJwt,
    })) as Record<string, unknown>;

    const updated: ShelfSession = {
      did: String(data.did),
      handle: String(data.handle),
      accessJwt: String(data.accessJwt),
      refreshJwt: String(data.refreshJwt),
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
}
