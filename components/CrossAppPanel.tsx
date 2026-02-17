"use client";

import { useState } from "react";
import { ATMOSPHERE_APPS } from "@/lib/lexicons";

export default function CrossAppPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #e5e7eb" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
        style={{ background: "#f0fdf4" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
              background: "#dcfce7",
              color: "#16a34a",
              fontFamily: "var(--mono)",
              fontSize: 10,
            }}
          >
            INTEROP
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Cross-app references via AT URIs
          </span>
        </div>
        <span className="text-xs" style={{ color: "#9ca3af" }}>
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="p-4" style={{ background: "#fff" }}>
          <p
            className="text-xs leading-relaxed mb-4"
            style={{ color: "#6b7280" }}
          >
            Shared Shelf items can reference content from{" "}
            <strong>any</strong> Atmosphere app using AT URIs. This is the
            interoperability promise of AT Protocol — your data connects across
            the entire ecosystem.
          </p>

          <div className="space-y-2">
            {ATMOSPHERE_APPS.map((app) => (
              <div
                key={app.name}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}
              >
                <span className="text-lg flex-shrink-0 leading-none">
                  {app.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium"
                    style={{ color: "#374151" }}
                  >
                    {app.name}
                  </div>
                  <div className="text-xs" style={{ color: "#9ca3af" }}>
                    {app.desc}
                  </div>
                </div>
                <code
                  className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded"
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {app.lexicon}
                </code>
              </div>
            ))}
          </div>

          <div
            className="mt-4 p-3 rounded-xl text-xs leading-relaxed"
            style={{
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              color: "#1e40af",
            }}
          >
            <strong>Example:</strong> A Shared Shelf item with{" "}
            <code
              style={{
                fontFamily: "var(--mono)",
                background: "#dbeafe",
                padding: "1px 4px",
                borderRadius: 3,
                fontSize: 10,
              }}
            >
              ref: &quot;at://danabra.mov/app.bsky.feed.post/3l4...&quot;
            </code>{" "}
            links directly to Dan Abramov&apos;s Bluesky post — no copy-paste, just a
            pointer. The post stays in his repo; your collection references it.
          </div>
        </div>
      )}
    </div>
  );
}
