// Shared TypeScript types for Shared Shelf

export interface ShelfItem {
  id: string;
  title: string;
  note?: string;
  url?: string;
  atUri?: string;
  tags?: string[];
  rating?: number;
  createdAt?: string;
}

export interface ShelfCollection {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color: string;
  visibility: "public" | "mutuals" | "private";
  items: ShelfItem[];
  createdAt?: string;
}

export interface CollectionTemplate {
  icon: string;
  name: string;
  desc: string;
  color: string;
}

export interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    $type: string;
  };
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
}

export type ViewMode = "shelf" | "protocol";
