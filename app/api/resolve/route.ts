import { NextRequest, NextResponse } from "next/server";

const BSKY_PUBLIC_API = "https://public.api.bsky.app/xrpc";

// AT URI resolution proxy — avoids CORS issues when called from the browser
// GET /api/resolve?uri=at://did/collection/rkey
export async function GET(request: NextRequest) {
  const uri = request.nextUrl.searchParams.get("uri");

  if (!uri || !uri.startsWith("at://")) {
    return NextResponse.json(
      { error: "Invalid or missing AT URI" },
      { status: 400 }
    );
  }

  const parts = uri.replace("at://", "").split("/");
  if (parts.length < 3) {
    return NextResponse.json(
      { error: "AT URI must have format at://repo/collection/rkey" },
      { status: 400 }
    );
  }

  const [repo, collection, rkey] = parts;

  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/com.atproto.repo.getRecord?` +
        `repo=${encodeURIComponent(repo)}&` +
        `collection=${encodeURIComponent(collection)}&` +
        `rkey=${encodeURIComponent(rkey)}`,
      { next: { revalidate: 300 } } // cache for 5 minutes
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve AT URI" },
      { status: 500 }
    );
  }
}
