import { NextRequest, NextResponse } from "next/server";

const BSKY_PDS = "https://bsky.social/xrpc";

// Proxy login to avoid CORS — browser → our API → bsky.social
// POST /api/auth/login  { identifier, password }
export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "identifier and password are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BSKY_PDS}/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Login failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Bluesky. Check your connection." },
      { status: 500 }
    );
  }
}
