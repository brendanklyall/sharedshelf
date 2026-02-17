// AT Protocol API helpers — all public endpoints, no auth needed

const BSKY_PUBLIC_API = "https://public.api.bsky.app/xrpc";

// Resolve an AT URI to its record (public, no auth needed)
// AT URIs: at://did/collection/rkey
export async function resolveATUri(uri: string) {
  if (!uri.startsWith("at://")) return null;
  try {
    const parts = uri.replace("at://", "").split("/");
    const [repo, collection, rkey] = parts;
    if (!repo || !collection || !rkey) return null;
    const res = await fetch(
      `${BSKY_PUBLIC_API}/com.atproto.repo.getRecord?` +
      `repo=${encodeURIComponent(repo)}&` +
      `collection=${encodeURIComponent(collection)}&` +
      `rkey=${encodeURIComponent(rkey)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Get a Bluesky profile (public)
export async function getProfile(actor: string) {
  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Search Bluesky posts (public, no auth)
export async function searchPosts(query: string, limit = 5) {
  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/app.bsky.feed.searchPosts?` +
      `q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

// Search Bluesky profiles (public, no auth)
export async function searchProfiles(query: string, limit = 5) {
  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/app.bsky.actor.searchActors?` +
      `q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.actors || [];
  } catch {
    return [];
  }
}

// Detect AT URI from known Atmosphere app URLs
export function urlToATUri(url: string): string | null {
  // bsky.app post URLs
  const bskyMatch = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/]+)/);
  if (bskyMatch) return `at://${bskyMatch[1]}/app.bsky.feed.post/${bskyMatch[2]}`;

  // WhiteWind blog entries
  const whtwndMatch = url.match(/whtwnd\.com\/([^/]+)\/entries\/([^/]+)/);
  if (whtwndMatch) return `at://${whtwndMatch[1]}/com.whtwnd.blog.entry/${whtwndMatch[2]}`;

  // Frontpage posts
  const frontpageMatch = url.match(/frontpage\.fyi\/post\/([^/]+)/);
  if (frontpageMatch) return `at://frontpage.fyi/fyi.unravel.frontpage.post/${frontpageMatch[1]}`;

  return null;
}
