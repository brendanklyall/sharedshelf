import { NextRequest, NextResponse } from "next/server";

const BSKY_PDS = "https://bsky.social/xrpc";

// Proxy session refresh to avoid CORS
// POST /api/auth/refresh  { refreshJwt }
export async function POST(request: NextRequest) {
  try {
    const { refreshJwt } = await request.json();

    if (!refreshJwt) {
      return NextResponse.json(
        { error: "refreshJwt is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BSKY_PDS}/com.atproto.server.refreshSession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshJwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Session refresh failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to refresh session." },
      { status: 500 }
    );
  }
}
