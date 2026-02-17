"use client";

import { useState } from "react";
import { LEXICON_SCHEMAS } from "@/lib/lexicons";

const EXAMPLE_CODE = `// Collection record in YOUR repo:
// at://did:plc:your-did/social.sharedshelf.collection/col-1

{
  "$type": "social.sharedshelf.collection",
  "name": "Books That Changed How I Think",
  "icon": "📚",
  "visibility": "public",
  "collaborators": [
    "did:plc:friend-1",  // They can add items too
    "did:plc:friend-2"
  ],
  "createdAt": "2026-02-16T10:00:00Z"
}

// Item referencing a Bluesky post (cross-app!):
// at://did:plc:your-did/social.sharedshelf.item/item-6

{
  "$type": "social.sharedshelf.item",
  "collection": "at://did:plc:your-did/.../col-2",
  "title": "Where It's at:// — Dan Abramov",
  "ref": "at://danabra.mov/app.bsky.feed.post/3l4...",
  "note": "Best explanation of AT URIs and DIDs I've found.",
  "tags": ["atproto", "explainer"],
  "rating": 5,
  "createdAt": "2026-02-16T10:05:00Z"
}`;

export default function LexiconViewer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #e5e7eb" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
        style={{ background: "#f8fafc" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
              background: "#dbeafe",
              color: "#2563eb",
              fontFamily: "var(--mono)",
              fontSize: 10,
            }}
          >
            LEXICON
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "#374151" }}
          >
            How your data is structured on AT Protocol
          </span>
        </div>
        <span className="text-xs" style={{ color: "#9ca3af" }}>
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4" style={{ background: "#fff" }}>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            Every collection and item you create is stored as a{" "}
            <strong>Lexicon-typed record</strong> in your AT Protocol data
            repository. This means your data is portable, interoperable, and
            owned by you — not by Shared Shelf.
          </p>

          {/* Schema IDs */}
          <div className="flex flex-wrap gap-2">
            {Object.values(LEXICON_SCHEMAS).map((schema) => (
              <span
                key={schema.id}
                className="px-2 py-1 rounded-lg text-xs"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "var(--mono)",
                  border: "1px solid #e2e8f0",
                }}
              >
                {schema.id}
              </span>
            ))}
          </div>

          {/* Code block */}
          <div
            className="rounded-xl p-4 overflow-auto"
            style={{ background: "#0f172a", maxHeight: 280 }}
          >
            <pre
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                lineHeight: 1.7,
                color: "#94a3b8",
                margin: 0,
                whiteSpace: "pre",
              }}
            >
              <span style={{ color: "#64748b" }}>{EXAMPLE_CODE.split("\n").map((line, i) => {
                // Highlight comments in a muted color
                if (line.trim().startsWith("//")) {
                  return <span key={i} style={{ color: "#475569" }}>{line}{"\n"}</span>;
                }
                // Highlight keys
                const highlighted = line.replace(
                  /"(\$type|name|icon|visibility|collaborators|createdAt|collection|title|ref|note|tags|rating)":/g,
                  (match, key) => `"${key}":`
                );
                return <span key={i}>{highlighted}{"\n"}</span>;
              })}</span>
            </pre>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Your Data", desc: "Lives in YOUR repo, not our DB", icon: "🏠" },
              { label: "Cross-App", desc: "AT URIs link to any Atmosphere app", icon: "🔗" },
              { label: "Portable", desc: "Move PDS, keep everything", icon: "📦" },
            ].map((f) => (
              <div
                key={f.label}
                className="p-2.5 rounded-lg text-center"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div className="text-xl mb-1">{f.icon}</div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "#374151" }}
                >
                  {f.label}
                </div>
                <div
                  className="mt-0.5 leading-snug"
                  style={{ color: "#9ca3af", fontSize: 10 }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
