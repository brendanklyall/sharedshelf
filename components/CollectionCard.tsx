"use client";

import type { ShelfCollection } from "@/lib/types";

interface CollectionCardProps {
  collection: ShelfCollection;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export default function CollectionCard({
  collection,
  isActive,
  onClick,
  onDelete,
}: CollectionCardProps) {
  const itemCount = collection.items?.length || 0;

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-xl transition-all"
        style={{
          background: isActive ? `${collection.color}0d` : "transparent",
          border: isActive
            ? `1.5px solid ${collection.color}35`
            : "1.5px solid transparent",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0 leading-none">
            {collection.icon || "📦"}
          </span>
          <div className="flex-1 min-w-0 pr-5">
            <div
              className="font-medium text-sm truncate"
              style={{ color: "#1a1a1a", fontFamily: "var(--serif)" }}
            >
              {collection.name}
            </div>
            <div className="text-xs" style={{ color: "#a3a3a3" }}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </div>
          </div>
          {isActive && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: collection.color }}
            />
          )}
        </div>
      </button>

      {/* Delete button — appears on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm(
                `Delete "${collection.name}" and all its items? This cannot be undone.`
              )
            ) {
              onDelete(collection.id);
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#fef2f2", color: "#dc2626" }}
          title="Delete collection"
        >
          ×
        </button>
      )}
    </div>
  );
}
