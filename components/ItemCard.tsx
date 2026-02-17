"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import Tag from "./Tag";
import type { ShelfItem } from "@/lib/types";

interface ItemCardProps {
  item: ShelfItem;
  color: string;
  onDelete?: () => void;
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function ItemCard({ item, color, onDelete }: ItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group rounded-xl p-4 transition-all hover:shadow-md"
      style={{ background: "#fff", border: "1px solid #f1f0ee" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4
              className="font-medium text-sm leading-snug"
              style={{ color: "#1a1a1a", fontFamily: "var(--serif)" }}
            >
              {item.title}
            </h4>
            {item.atUri && (
              <span
                className="flex-shrink-0 px-1.5 py-0.5 rounded"
                style={{
                  background: "#dbeafe",
                  color: "#2563eb",
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                }}
              >
                at://
              </span>
            )}
          </div>
          {item.rating ? <StarRating rating={item.rating} readonly /> : null}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {item.note && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
              style={{ background: "#f5f5f4", color: "#737373" }}
              title={expanded ? "Collapse" : "Expand note"}
            >
              {expanded ? "−" : "+"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors hover:bg-red-100"
              style={{ background: "#fef2f2", color: "#dc2626" }}
              title="Delete item"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {item.note && (
        <p
          className={`mt-2 text-sm leading-relaxed transition-all ${
            expanded ? "" : "line-clamp-2"
          }`}
          style={{ color: "#525252" }}
        >
          {item.note}
        </p>
      )}

      {(item.tags?.length || item.url) && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {item.tags?.map((t) => (
            <Tag key={t} label={t} color={color} />
          ))}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 hover:underline transition-colors"
              style={{ color: "#2563eb" }}
            >
              ↗ {safeHostname(item.url)}
            </a>
          )}
        </div>
      )}

      {item.atUri && expanded && (
        <div
          className="mt-3 px-2.5 py-1.5 rounded-lg text-xs"
          style={{
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            fontFamily: "var(--mono)",
            color: "#2563eb",
            wordBreak: "break-all",
          }}
        >
          {item.atUri}
        </div>
      )}
    </div>
  );
}
