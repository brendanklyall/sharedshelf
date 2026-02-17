// PDS (Personal Data Server) read/write helpers.
// All records use our custom Lexicons:
//   social.sharedshelf.collection
//   social.sharedshelf.item

import { getAgent } from "./auth";
import { generateTID } from "./tid";
import type { ShelfCollection, ShelfItem } from "./types";

const COL_NSID = "social.sharedshelf.collection";
const ITEM_NSID = "social.sharedshelf.item";

// Build the AT URI for a collection record
export function collectionUri(did: string, rkey: string): string {
  return `at://${did}/${COL_NSID}/${rkey}`;
}

// ─── Reads ────────────────────────────────────────────────────

export async function fetchCollections(
  did: string
): Promise<ShelfCollection[]> {
  const agent = getAgent();

  const [colResult, itemResult] = await Promise.all([
    agent.com.atproto.repo.listRecords({
      repo: did,
      collection: COL_NSID,
      limit: 100,
    }),
    agent.com.atproto.repo.listRecords({
      repo: did,
      collection: ITEM_NSID,
      limit: 100,
    }),
  ]);

  // Build collections from records — rkey becomes the local id
  const collections: ShelfCollection[] = colResult.data.records.map((rec) => {
    const v = rec.value as Record<string, unknown>;
    const rkey = rec.uri.split("/").pop()!;
    return {
      id: rkey,
      name: String(v.name ?? "Untitled"),
      icon: String(v.icon ?? "📦"),
      description: v.description ? String(v.description) : undefined,
      color: String(v.color ?? "#525252"),
      visibility:
        (v.visibility as ShelfCollection["visibility"]) ?? "public",
      createdAt: String(v.createdAt ?? ""),
      items: [],
    };
  });

  // Map collection AT URI → ShelfCollection for item grouping
  const uriToCol = new Map<string, ShelfCollection>();
  colResult.data.records.forEach((rec, i) => {
    uriToCol.set(rec.uri, collections[i]);
  });

  // Attach items to their parent collections
  itemResult.data.records.forEach((rec) => {
    const v = rec.value as Record<string, unknown>;
    const parentUri = String(v.collection ?? "");
    const col = uriToCol.get(parentUri);
    if (!col) return;

    const rkey = rec.uri.split("/").pop()!;
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

// Returns the rkey used (also becomes the collection's local id)
export async function putCollection(
  did: string,
  collection: ShelfCollection
): Promise<string> {
  const agent = getAgent();
  const rkey = generateTID();

  await agent.com.atproto.repo.putRecord({
    repo: did,
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
  });

  return rkey;
}

export async function deleteCollectionFromPDS(
  did: string,
  rkey: string,
  itemRkeys: string[]
): Promise<void> {
  const agent = getAgent();

  // Delete all child items first
  await Promise.all(
    itemRkeys.map((itemRkey) =>
      agent.com.atproto.repo.deleteRecord({
        repo: did,
        collection: ITEM_NSID,
        rkey: itemRkey,
      })
    )
  );

  // Then delete the collection record
  await agent.com.atproto.repo.deleteRecord({
    repo: did,
    collection: COL_NSID,
    rkey,
  });
}

// ─── Item writes ─────────────────────────────────────────────

// Returns the rkey used (also becomes the item's local id)
export async function putItem(
  did: string,
  collectionRkey: string,
  item: ShelfItem
): Promise<string> {
  const agent = getAgent();
  const rkey = generateTID();
  const colUri = collectionUri(did, collectionRkey);

  await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: ITEM_NSID,
    rkey,
    record: {
      $type: ITEM_NSID,
      collection: colUri,
      title: item.title,
      note: item.note ?? undefined,
      url: item.url ?? undefined,
      ref: item.atUri ?? undefined,
      tags: item.tags ?? [],
      rating: item.rating ?? undefined,
      createdAt: new Date().toISOString(),
    },
  });

  return rkey;
}

export async function deleteItemFromPDS(
  did: string,
  rkey: string
): Promise<void> {
  const agent = getAgent();
  await agent.com.atproto.repo.deleteRecord({
    repo: did,
    collection: ITEM_NSID,
    rkey,
  });
}
