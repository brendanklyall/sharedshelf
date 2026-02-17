// PDS read/write helpers using raw fetch — no @atproto/api dependency.
// All XRPC endpoints are plain REST calls that work in any browser.

import { generateTID } from "./tid";
import type { ShelfCollection, ShelfItem } from "./types";
import type { ShelfSession } from "./auth";

const PDS = "https://bsky.social/xrpc";
const COL_NSID = "social.sharedshelf.collection";
const ITEM_NSID = "social.sharedshelf.item";

// ─── Raw XRPC helpers ────────────────────────────────────────

async function get(
  endpoint: string,
  params: Record<string, string>,
  accessJwt: string
): Promise<Record<string, unknown>> {
  const url = new URL(`${PDS}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessJwt}` },
  });

  const text = await res.text();
  if (!text) throw new Error(`Empty response from ${endpoint}`);
  const data = JSON.parse(text) as Record<string, unknown>;
  if (!res.ok) throw new Error(String(data.message || data.error || `HTTP ${res.status}`));
  return data;
}

async function post(
  endpoint: string,
  body: unknown,
  accessJwt: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${PDS}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessJwt}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) throw new Error(String(data.message || data.error || `HTTP ${res.status}`));
  return data;
}

// ─── AT URI helpers ───────────────────────────────────────────

export function collectionUri(did: string, rkey: string): string {
  return `at://${did}/${COL_NSID}/${rkey}`;
}

// ─── Fetch all collections + items ───────────────────────────

export async function fetchCollections(
  session: ShelfSession
): Promise<ShelfCollection[]> {
  const { did, accessJwt } = session;

  const [colResult, itemResult] = await Promise.all([
    get("com.atproto.repo.listRecords", { repo: did, collection: COL_NSID, limit: "100" }, accessJwt),
    get("com.atproto.repo.listRecords", { repo: did, collection: ITEM_NSID, limit: "100" }, accessJwt),
  ]);

  const colRecords = (colResult.records as Record<string, unknown>[]) ?? [];
  const itemRecords = (itemResult.records as Record<string, unknown>[]) ?? [];

  const collections: ShelfCollection[] = colRecords.map((rec) => {
    const v = rec.value as Record<string, unknown>;
    const rkey = String(rec.uri).split("/").pop()!;
    return {
      id: rkey,
      name: String(v.name ?? "Untitled"),
      icon: String(v.icon ?? "📦"),
      description: v.description ? String(v.description) : undefined,
      color: String(v.color ?? "#525252"),
      visibility: (v.visibility as ShelfCollection["visibility"]) ?? "public",
      createdAt: String(v.createdAt ?? ""),
      items: [],
    };
  });

  // Map collection URI → ShelfCollection for attaching items
  const uriToCol = new Map<string, ShelfCollection>();
  colRecords.forEach((rec, i) => uriToCol.set(String(rec.uri), collections[i]));

  itemRecords.forEach((rec) => {
    const v = rec.value as Record<string, unknown>;
    const col = uriToCol.get(String(v.collection ?? ""));
    if (!col) return;

    const rkey = String(rec.uri).split("/").pop()!;
    col.items.push({
      id: rkey,
      title: String(v.title ?? ""),
      note: v.note ? String(v.note) : undefined,
      url: v.url ? String(v.url) : undefined,
      atUri: v.ref ? String(v.ref) : undefined,
      tags: Array.isArray(v.tags) ? (v.tags as unknown[]).map(String) : [],
      rating: v.rating ? Number(v.rating) : undefined,
      createdAt: String(v.createdAt ?? ""),
    });
  });

  return collections;
}

// ─── Collection writes ────────────────────────────────────────

export async function putCollection(
  session: ShelfSession,
  collection: ShelfCollection
): Promise<string> {
  const rkey = generateTID();
  await post(
    "com.atproto.repo.putRecord",
    {
      repo: session.did,
      collection: COL_NSID,
      rkey,
      record: {
        $type: COL_NSID,
        name: collection.name,
        description: collection.description ?? undefined,
        icon: collection.icon,
        color: collection.color,
        visibility: collection.visibility,
        createdAt: new Date().toISOString(),
      },
    },
    session.accessJwt
  );
  return rkey;
}

export async function deleteCollectionFromPDS(
  session: ShelfSession,
  rkey: string,
  itemRkeys: string[]
): Promise<void> {
  // Delete all child items first
  await Promise.all(
    itemRkeys.map((itemRkey) =>
      post(
        "com.atproto.repo.deleteRecord",
        { repo: session.did, collection: ITEM_NSID, rkey: itemRkey },
        session.accessJwt
      )
    )
  );
  // Then delete the collection
  await post(
    "com.atproto.repo.deleteRecord",
    { repo: session.did, collection: COL_NSID, rkey },
    session.accessJwt
  );
}

// ─── Item writes ─────────────────────────────────────────────

export async function putItem(
  session: ShelfSession,
  collectionRkey: string,
  item: ShelfItem
): Promise<string> {
  const rkey = generateTID();
  await post(
    "com.atproto.repo.putRecord",
    {
      repo: session.did,
      collection: ITEM_NSID,
      rkey,
      record: {
        $type: ITEM_NSID,
        collection: collectionUri(session.did, collectionRkey),
        title: item.title,
        note: item.note ?? undefined,
        url: item.url ?? undefined,
        ref: item.atUri ?? undefined,
        tags: item.tags ?? [],
        rating: item.rating ?? undefined,
        createdAt: new Date().toISOString(),
      },
    },
    session.accessJwt
  );
  return rkey;
}

export async function deleteItemFromPDS(
  session: ShelfSession,
  rkey: string
): Promise<void> {
  await post(
    "com.atproto.repo.deleteRecord",
    { repo: session.did, collection: ITEM_NSID, rkey },
    session.accessJwt
  );
}
