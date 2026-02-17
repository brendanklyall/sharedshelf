"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import type { ShelfItem, BlueskyPost } from "@/lib/types";
import { searchPosts } from "@/lib/atproto";

interface AddItemModalProps {
  onAdd: (item: ShelfItem) => void;
  onClose: () => void;
  color: string;
}

type Mode = "manual" | "bluesky";

export default function AddItemModal({ onAdd, onClose, color }: AddItemModalProps) {
  const [mode, setMode] = useState<Mode>("manual");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BlueskyPost[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const posts = await searchPosts(searchQuery, 6);
    setSearchResults(posts);
    setSearching(false);
    setSearched(true);
  };

  const importPost = (post: BlueskyPost) => {
    const postText = post.record?.text || "";
    const authorName = post.author?.displayName || post.author?.handle || "";
    const handle = post.author?.handle || "";
    const rkey = post.uri?.split("/").pop() || "";

    setTitle(
      authorName
        ? `${authorName}: "${postText.slice(0, 60)}${postText.length > 60 ? "…" : ""}"`
        : postText.slice(0, 80)
    );
    setNote(postText);
    setUrl(`https://bsky.app/profile/${handle}/post/${rkey}`);
    setMode("manual");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const bskyUrlMatch = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/]+)/);
    const atUri = bskyUrlMatch
      ? `at://${bskyUrlMatch[1]}/app.bsky.feed.post/${bskyUrlMatch[2]}`
      : undefined;

    onAdd({
      id: `item-${Date.now()}`,
      title: title.trim(),
      note: note.trim() || undefined,
      url: url.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      rating: rating || undefined,
      atUri,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden fade-in-fast"
        style={{ background: "#fafaf9" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #f1f0ee" }}
        >
          <h3
            className="font-semibold text-base"
            style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
          >
            Add to shelf
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors hover:bg-stone-100"
            style={{ background: "#f5f5f4", color: "#737373" }}
          >
            ×
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 px-5 pt-4">
          <button
            onClick={() => setMode("manual")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: mode === "manual" ? `${color}18` : "transparent",
              color: mode === "manual" ? color : "#a3a3a3",
            }}
          >
            Add manually
          </button>
          <button
            onClick={() => setMode("bluesky")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: mode === "bluesky" ? `${color}18` : "transparent",
              color: mode === "bluesky" ? color : "#a3a3a3",
            }}
          >
            🦋 Import from Bluesky
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Bluesky search panel */}
          {mode === "bluesky" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  placeholder="Search Bluesky posts…"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                  }}
                  autoFocus
                />
                <button
                  onClick={doSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                  style={{ background: color, color: "#fff" }}
                >
                  {searching ? "…" : "Search"}
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((post) => (
                  <button
                    key={post.uri}
                    onClick={() => importPost(post)}
                    className="w-full text-left p-3 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: "#fff", border: "1px solid #f1f0ee" }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {post.author?.avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.author.avatar}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          alt=""
                        />
                      )}
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#525252" }}
                      >
                        {post.author?.displayName || post.author?.handle}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded ml-auto flex-shrink-0"
                        style={{
                          background: "#dbeafe",
                          color: "#2563eb",
                          fontFamily: "var(--mono)",
                          fontSize: 9,
                        }}
                      >
                        at://
                      </span>
                    </div>
                    <p
                      className="text-xs line-clamp-2 text-left"
                      style={{ color: "#737373" }}
                    >
                      {post.record?.text}
                    </p>
                  </button>
                ))}
                {searched && searchResults.length === 0 && !searching && (
                  <div
                    className="text-center py-8 text-xs"
                    style={{ color: "#a3a3a3" }}
                  >
                    No results found. Try different keywords.
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <p className="text-xs" style={{ color: "#a3a3a3" }}>
                  Click a post to import it as a shelf item
                </p>
              )}
            </div>
          )}

          {/* Manual form */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title — book name, restaurant, link, idea…"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-medium outline-none"
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              fontFamily: "var(--serif)",
            }}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your notes — why is this worth saving?"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none"
            style={{ background: "#fff", border: "1px solid #e5e5e5" }}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              fontFamily: "var(--mono)",
              fontSize: 12,
            }}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags — comma separated (e.g. tech, leadership, must-read)"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#fff", border: "1px solid #e5e5e5" }}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#a3a3a3" }}>
              Rating:
            </span>
            <StarRating rating={rating} onChange={setRating} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 pb-5 flex justify-end gap-2"
          style={{ borderTop: "1px solid #f1f0ee", paddingTop: 16 }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-stone-100"
            style={{ color: "#737373" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all hover:shadow-md"
            style={{ background: color, color: "#fff" }}
          >
            Add to shelf
          </button>
        </div>
      </div>
    </div>
  );
}
