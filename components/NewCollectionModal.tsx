"use client";

import { useState } from "react";
import type { ShelfCollection, CollectionTemplate } from "@/lib/types";

const TEMPLATES: CollectionTemplate[] = [
  { icon: "📚", name: "Books", desc: "Books I've read, want to read, or recommend", color: "#d97706" },
  { icon: "🍽️", name: "Restaurants", desc: "Places to eat — tried and want to try", color: "#dc2626" },
  { icon: "✈️", name: "Travel", desc: "Destinations, tips, and travel memories", color: "#2563eb" },
  { icon: "🎬", name: "Watch List", desc: "Movies, shows, and documentaries", color: "#7c3aed" },
  { icon: "🎵", name: "Music", desc: "Albums, playlists, and discoveries", color: "#059669" },
  { icon: "💡", name: "Ideas", desc: "Thoughts, inspirations, and things to explore", color: "#ea580c" },
  { icon: "🔗", name: "Links", desc: "Articles, tools, and resources worth saving", color: "#0891b2" },
  { icon: "🎁", name: "Gift Ideas", desc: "Gift inspiration for friends and family", color: "#be185d" },
];

interface NewCollectionModalProps {
  onAdd: (collection: ShelfCollection) => void;
  onClose: () => void;
}

export default function NewCollectionModal({ onAdd, onClose }: NewCollectionModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selected, setSelected] = useState<CollectionTemplate | null>(null);
  const [customIcon, setCustomIcon] = useState("📦");
  const [customColor, setCustomColor] = useState("#525252");

  const handleTemplateSelect = (t: CollectionTemplate) => {
    setSelected(t);
    setName(t.name);
    setDesc(t.desc);
    setCustomIcon(t.icon);
    setCustomColor(t.color);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: desc.trim() || undefined,
      icon: customIcon,
      color: selected?.color || customColor,
      visibility: "public",
      items: [],
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
            New collection
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors hover:bg-stone-100"
            style={{ background: "#f5f5f4", color: "#737373" }}
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Templates */}
          <div
            className="text-xs font-medium mb-3 tracking-widest"
            style={{ color: "#a3a3a3" }}
          >
            START FROM A TEMPLATE
          </div>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => handleTemplateSelect(t)}
                className="p-3 rounded-xl text-center transition-all hover:shadow-sm"
                style={{
                  background:
                    selected?.name === t.name ? `${t.color}12` : "#fff",
                  border:
                    selected?.name === t.name
                      ? `1.5px solid ${t.color}45`
                      : "1.5px solid #f1f0ee",
                }}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "#525252" }}
                >
                  {t.name}
                </div>
              </button>
            ))}
          </div>

          {/* Custom fields */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                className="w-14 px-2 py-2.5 rounded-lg text-center text-xl outline-none"
                style={{ background: "#fff", border: "1px solid #e5e5e5" }}
                maxLength={2}
                title="Collection emoji"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  fontFamily: "var(--serif)",
                }}
                autoFocus={!selected}
              />
            </div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this collection about?"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none"
              style={{ background: "#fff", border: "1px solid #e5e5e5" }}
            />
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
            disabled={!name.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all hover:shadow-md"
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            Create collection
          </button>
        </div>
      </div>
    </div>
  );
}
