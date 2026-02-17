"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CollectionCard from "./CollectionCard";
import ItemCard from "./ItemCard";
import AddItemModal from "./AddItemModal";
import NewCollectionModal from "./NewCollectionModal";
import SignInModal from "./SignInModal";
import LexiconViewer from "./LexiconViewer";
import CrossAppPanel from "./CrossAppPanel";
import { SAMPLE_COLLECTIONS } from "@/lib/sample-data";
import {
  loadSession,
  resumeSession,
  clearSession,
  type ShelfSession,
} from "@/lib/auth";
import {
  fetchCollections,
  putCollection,
  deleteCollectionFromPDS,
  putItem,
  deleteItemFromPDS,
} from "@/lib/pds";
import type { ShelfCollection, ShelfItem, ViewMode } from "@/lib/types";

export default function ShelfApp() {
  const searchParams = useSearchParams();

  // ─── Auth state ──────────────────────────────────────────────
  const [session, setSession] = useState<ShelfSession | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  // Auto-open sign-in modal if ?signin=1 in URL (from landing page CTA)
  const [showSignIn, setShowSignIn] = useState(
    searchParams.get("signin") === "1"
  );
  const [pdsLoading, setPdsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // ─── Shelf state ─────────────────────────────────────────────
  const [collections, setCollections] = useState<ShelfCollection[]>(SAMPLE_COLLECTIONS);
  const [activeColId, setActiveColId] = useState<string>(SAMPLE_COLLECTIONS[0]?.id);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showNewCol, setShowNewCol] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("shelf");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── On mount: try to resume session ─────────────────────────
  useEffect(() => {
    const stored = loadSession();
    if (!stored) return; // no session → button already visible, nothing to do

    setAuthLoading(true);
    resumeSession(stored)
      .then(async (resumed) => {
        if (resumed) {
          setSession(resumed);
          await loadFromPDS(resumed);
        }
      })
      .catch(() => {
        // Silently clear a bad session
        clearSession();
      })
      .finally(() => {
        setAuthLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load collections from PDS ───────────────────────────────
  async function loadFromPDS(s: ShelfSession) {
    setPdsLoading(true);
    setSyncError(null);
    try {
      const cols = await fetchCollections(s);
      setCollections(cols.length > 0 ? cols : []);
      setActiveColId(cols[0]?.id ?? "");
    } catch (err) {
      setSyncError("Couldn't load from your PDS. Showing demo data.");
      setCollections(SAMPLE_COLLECTIONS);
      setActiveColId(SAMPLE_COLLECTIONS[0]?.id);
      console.error(err);
    } finally {
      setPdsLoading(false);
    }
  }

  // ─── Sign in ─────────────────────────────────────────────────
  const handleSignIn = async (newSession: ShelfSession) => {
    setSession(newSession);
    setShowSignIn(false);
    await loadFromPDS(newSession);
  };

  // ─── Sign out ────────────────────────────────────────────────
  const handleSignOut = () => {
    clearSession();
    setSession(null);
    setCollections(SAMPLE_COLLECTIONS);
    setActiveColId(SAMPLE_COLLECTIONS[0]?.id);
    setSyncError(null);
  };

  // ─── Derived state ───────────────────────────────────────────
  const active = collections.find((c) => c.id === activeColId);
  const totalItems = collections.reduce((s, c) => s + (c.items?.length || 0), 0);
  const isLive = !!session;

  const filteredItems =
    active?.items?.filter((item) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }) || [];

  // ─── CRUD — add item ─────────────────────────────────────────
  const addItem = async (item: ShelfItem) => {
    // Optimistic local update
    const tempItem = { ...item };
    setCollections((prev) =>
      prev.map((c) =>
        c.id === activeColId ? { ...c, items: [...(c.items || []), tempItem] } : c
      )
    );

    // Write to PDS if live
    if (session && activeColId) {
      try {
        const rkey = await putItem(session, activeColId, item);
        // Update the local id to match the PDS rkey
        setCollections((prev) =>
          prev.map((c) =>
            c.id === activeColId
              ? {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === tempItem.id ? { ...i, id: rkey } : i
                  ),
                }
              : c
          )
        );
      } catch {
        setSyncError("Item saved locally but failed to sync to your PDS.");
      }
    }
  };

  // ─── CRUD — delete item ──────────────────────────────────────
  const deleteItem = async (itemId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === activeColId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );

    if (session) {
      try {
        await deleteItemFromPDS(session, itemId);
      } catch {
        setSyncError("Item removed locally but failed to delete from your PDS.");
      }
    }
  };

  // ─── CRUD — add collection ───────────────────────────────────
  const addCollection = async (col: ShelfCollection) => {
    const tempCol = { ...col };
    setCollections((prev) => [...prev, tempCol]);
    setActiveColId(tempCol.id);
    setShowNewCol(false);

    if (session) {
      try {
        const rkey = await putCollection(session, col);
        // Update local id to PDS rkey
        setCollections((prev) =>
          prev.map((c) =>
            c.id === tempCol.id ? { ...c, id: rkey } : c
          )
        );
        setActiveColId(rkey);
      } catch {
        setSyncError("Collection saved locally but failed to sync to your PDS.");
      }
    }
  };

  // ─── CRUD — delete collection ────────────────────────────────
  const deleteCollection = async (colId: string) => {
    const col = collections.find((c) => c.id === colId);
    setCollections((prev) => {
      const filtered = prev.filter((c) => c.id !== colId);
      if (activeColId === colId && filtered.length > 0) {
        setActiveColId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveColId("");
      }
      return filtered;
    });

    if (session && col) {
      try {
        await deleteCollectionFromPDS(
          session,
          colId,
          col.items.map((i) => i.id)
        );
      } catch {
        setSyncError("Collection removed locally but failed to delete from your PDS.");
      }
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "#fafaf9", fontFamily: "var(--sans)" }}
    >
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(250,250,249,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f1f0ee",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: "#f5f5f4", color: "#737373" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl">📚</span>
              <span
                className="font-semibold tracking-tight"
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 18,
                  color: "#1a1a1a",
                }}
              >
                Shared Shelf
              </span>
            </a>

            {/* Mode badge */}
            {authLoading ? null : isLive ? (
              <span
                className="hidden sm:inline px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                }}
              >
                ● Live · AT Protocol
              </span>
            ) : (
              <span
                className="hidden sm:inline px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "#dbeafe",
                  color: "#2563eb",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                }}
              >
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View toggle */}
            <div
              className="flex gap-0.5 p-0.5 rounded-lg"
              style={{ background: "#f5f5f4" }}
            >
              {(["shelf", "protocol"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize"
                  style={{
                    background: view === v ? "#fff" : "transparent",
                    color: view === v ? "#1a1a1a" : "#a3a3a3",
                    boxShadow:
                      view === v ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            <div
              className="hidden sm:block text-xs"
              style={{ color: "#a3a3a3" }}
            >
              {collections.length} collections · {totalItems} items
            </div>

            {/* Auth button */}
            {!authLoading &&
              (isLive ? (
                <div className="flex items-center gap-2">
                  <span
                    className="hidden sm:block text-xs font-medium"
                    style={{ color: "#525252", fontFamily: "var(--mono)" }}
                  >
                    @{session.handle}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:shadow-sm"
                    style={{
                      background: "#f5f5f4",
                      color: "#737373",
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignIn(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:shadow-md"
                  style={{ background: "#0560ff", color: "#fff" }}
                >
                  🦋 Sign in
                </button>
              ))}
          </div>
        </div>

        {/* Sync error banner */}
        {syncError && (
          <div
            className="px-4 py-2 flex items-center justify-between text-xs"
            style={{ background: "#fef2f2", borderTop: "1px solid #fecaca" }}
          >
            <span style={{ color: "#dc2626" }}>⚠ {syncError}</span>
            <button
              onClick={() => setSyncError(null)}
              className="ml-3 text-xs"
              style={{ color: "#dc2626" }}
            >
              ×
            </button>
          </div>
        )}
      </header>

      <div
        className="max-w-6xl mx-auto flex"
        style={{ minHeight: "calc(100vh - 53px)" }}
      >
        {/* ─── Sidebar ─── */}
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 sm:hidden"
              style={{ background: "rgba(0,0,0,0.25)" }}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed sm:sticky top-[53px] z-30 sm:z-auto
              h-[calc(100vh-53px)] sm:h-auto
              w-64 flex-shrink-0 flex flex-col
              transition-transform duration-200
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            `}
            style={{
              background: "#fafaf9",
              borderRight: "1px solid #f1f0ee",
              overflowY: "auto",
            }}
          >
            <div className="p-4 space-y-1 flex-1">
              <button
                onClick={() => {
                  setShowNewCol(true);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-sm mb-2"
                style={{
                  background: "#fff",
                  border: "1.5px dashed #d4d4d4",
                  color: "#737373",
                }}
              >
                <span className="text-base">+</span> New collection
              </button>

              {/* Loading state */}
              {pdsLoading && (
                <div
                  className="text-center py-8 text-xs"
                  style={{ color: "#a3a3a3" }}
                >
                  <div className="inline-block w-4 h-4 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin mb-2" />
                  <p>Loading from your PDS…</p>
                </div>
              )}

              {!pdsLoading && (
                <div className="space-y-0.5">
                  {collections.map((col) => (
                    <CollectionCard
                      key={col.id}
                      collection={col}
                      isActive={activeColId === col.id}
                      onClick={() => {
                        setActiveColId(col.id);
                        setSearchTerm("");
                        setSidebarOpen(false);
                      }}
                      onDelete={deleteCollection}
                    />
                  ))}

                  {collections.length === 0 && !pdsLoading && (
                    <div
                      className="text-center py-8 text-xs leading-relaxed"
                      style={{ color: "#a3a3a3" }}
                    >
                      {isLive
                        ? "No collections yet on your PDS.\nCreate your first one above."
                        : "No collections yet.\nCreate your first one above."}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Data ownership card */}
            <div className="p-4 pt-0">
              {isLive ? (
                <div
                  className="px-3 py-2.5 rounded-xl"
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: "#15803d" }}
                  >
                    ✓ Live AT Protocol
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "#16a34a", fontFamily: "var(--mono)", fontSize: 10 }}
                  >
                    at://{session?.handle}/
                    <br />
                    social.sharedshelf.*
                  </div>
                </div>
              ) : (
                <div
                  className="px-3 py-2.5 rounded-xl"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                  }}
                >
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: "#92400e" }}
                  >
                    🏠 Your data, your repo
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "#a16207" }}
                  >
                    Sign in with Bluesky to save collections to your AT Protocol
                    PDS.
                  </div>
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "#0560ff", color: "#fff" }}
                  >
                    🦋 Sign in with Bluesky
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>

        {/* ─── Main content ─── */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          {/* ── Shelf view ── */}
          {view === "shelf" && (
            <>
              {pdsLoading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin mb-4" />
                    <p className="text-sm" style={{ color: "#a3a3a3" }}>
                      Loading your shelf from AT Protocol PDS…
                    </p>
                  </div>
                </div>
              ) : active ? (
                <div className="fade-in">
                  {/* Collection header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-3xl leading-none">
                          {active.icon}
                        </span>
                        <h2
                          className="text-2xl font-semibold leading-tight"
                          style={{
                            fontFamily: "var(--serif)",
                            color: "#1a1a1a",
                          }}
                        >
                          {active.name}
                        </h2>
                      </div>
                      {active.description && (
                        <p
                          className="text-sm ml-12 sm:ml-14"
                          style={{ color: "#737373" }}
                        >
                          {active.description}
                        </p>
                      )}
                      <div className="ml-12 sm:ml-14 mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: `${active.color}14`,
                            color: active.color,
                          }}
                        >
                          {active.visibility}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "#a3a3a3" }}
                        >
                          {active.items?.length || 0} items
                        </span>
                        <span
                          className="hidden sm:inline px-1.5 py-0.5 rounded text-xs"
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          social.sharedshelf.collection
                        </span>
                        {isLive && (
                          <span
                            className="hidden sm:inline px-1.5 py-0.5 rounded text-xs"
                            style={{
                              background: "#dcfce7",
                              color: "#16a34a",
                              fontFamily: "var(--mono)",
                              fontSize: 9,
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            at://{session?.handle}/…/{active.id}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddItem(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md flex-shrink-0"
                      style={{ background: active.color, color: "#fff" }}
                    >
                      + Add item
                    </button>
                  </div>

                  {/* Search */}
                  {(active.items?.length || 0) > 3 && (
                    <div className="mb-4">
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search this collection…"
                        className="w-full max-w-sm px-3 py-2 rounded-xl text-sm outline-none transition-shadow focus:shadow-md"
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e5e5",
                        }}
                      />
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {filteredItems.map((item, i) => (
                      <div
                        key={item.id}
                        className={`fade-in-delay-${Math.min(i, 4)}`}
                      >
                        <ItemCard
                          item={item}
                          color={active.color}
                          onDelete={() => deleteItem(item.id)}
                        />
                      </div>
                    ))}

                    {filteredItems.length === 0 && !searchTerm && (
                      <div className="text-center py-20">
                        <div className="text-5xl mb-4">📦</div>
                        <p
                          className="text-sm font-medium mb-1"
                          style={{
                            color: "#525252",
                            fontFamily: "var(--serif)",
                          }}
                        >
                          This shelf is empty
                        </p>
                        <p className="text-sm mb-4" style={{ color: "#a3a3a3" }}>
                          {isLive
                            ? "Add your first item — it'll be written to your PDS."
                            : "Add your first item to get started."}
                        </p>
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="mt-1 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                          style={{ background: active.color, color: "#fff" }}
                        >
                          + Add item
                        </button>
                      </div>
                    )}

                    {filteredItems.length === 0 && searchTerm && (
                      <div
                        className="text-center py-12 text-sm"
                        style={{ color: "#a3a3a3" }}
                      >
                        No items matching &ldquo;{searchTerm}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">📚</div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "#525252", fontFamily: "var(--serif)" }}
                  >
                    {isLive ? "Your shelf is empty" : "No collection selected"}
                  </p>
                  <p className="text-sm mb-4" style={{ color: "#a3a3a3" }}>
                    {isLive
                      ? "Create your first collection — it'll be saved to your AT Protocol PDS."
                      : "Create your first collection to get started."}
                  </p>
                  <button
                    onClick={() => setShowNewCol(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                    style={{ background: "#1a1a1a", color: "#fff" }}
                  >
                    + New collection
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Protocol view ── */}
          {view === "protocol" && (
            <div className="max-w-2xl space-y-4 fade-in">
              <div className="mb-6">
                <h2
                  className="text-2xl font-semibold mb-2"
                  style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
                >
                  How Shared Shelf Uses AT Protocol
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#737373" }}
                >
                  Shared Shelf isn&apos;t just <em>on</em> the Atmosphere — it&apos;s
                  designed to demonstrate what makes AT Protocol fundamentally
                  different from conventional app architecture. Every feature
                  maps to a protocol primitive.
                </p>
                {isLive && (
                  <div
                    className="mt-3 px-3 py-2 rounded-xl text-xs"
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#15803d",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ✓ Signed in as @{session?.handle} · records writing to{" "}
                    at://{session?.did}/social.sharedshelf.*
                  </div>
                )}
              </div>

              <LexiconViewer />
              <CrossAppPanel />

              {/* Why this matters */}
              <div
                className="rounded-xl p-5"
                style={{ background: "#fefce8", border: "1px solid #fef9c3" }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <div>
                    <h4
                      className="font-medium text-sm mb-2"
                      style={{ color: "#854d0e", fontFamily: "var(--serif)" }}
                    >
                      Why this app matters for the Atmosphere
                    </h4>
                    <div
                      className="text-xs leading-relaxed space-y-2"
                      style={{ color: "#a16207" }}
                    >
                      <p>
                        <strong>Custom Lexicons prove the protocol is extensible.</strong>{" "}
                        When Shared Shelf defines{" "}
                        <code
                          style={{
                            fontFamily: "var(--mono)",
                            background: "#fef3c7",
                            padding: "1px 4px",
                            borderRadius: 3,
                            fontSize: 10,
                          }}
                        >
                          social.sharedshelf.collection
                        </code>{" "}
                        and{" "}
                        <code
                          style={{
                            fontFamily: "var(--mono)",
                            background: "#fef3c7",
                            padding: "1px 4px",
                            borderRadius: 3,
                            fontSize: 10,
                          }}
                        >
                          social.sharedshelf.item
                        </code>
                        , it demonstrates that any developer can create new data
                        types that live alongside Bluesky posts in users&apos; repos.
                      </p>
                      <p>
                        <strong>Cross-app AT URIs prove interoperability is real.</strong>{" "}
                        A Shared Shelf item can reference a Bluesky post, a
                        WhiteWind blog entry, a Frontpage link, or a Smoke Signal
                        event — all using the same AT URI scheme.
                      </p>
                      <p>
                        <strong>User-owned data proves the portability promise.</strong>{" "}
                        If you move your PDS tomorrow, every collection and item
                        moves with you. Your data is never trapped.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision card */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div className="px-4 py-3" style={{ background: "#faf5ff" }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: "#f3e8ff",
                        color: "#7c3aed",
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                      }}
                    >
                      VISION
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      The full collaborative experience
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3" style={{ background: "#fff" }}>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#6b7280" }}
                  >
                    In the full version, Shared Shelf becomes collaborative.
                    Because AT Protocol identities are universal:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "👥", title: "Shared collections", desc: "Invite friends via their DID. They add items from their own repos." },
                      { icon: "🔔", title: "Activity feeds", desc: "See when friends add items — powered by a custom feed generator." },
                      { icon: "🔍", title: "Discovery", desc: "Browse public shelves from anyone on the network." },
                      { icon: "🏷️", title: "Community Lexicons", desc: "Use shared schemas for books, recipes, locations." },
                    ].map((f) => (
                      <div
                        key={f.title}
                        className="p-3 rounded-xl"
                        style={{ background: "#faf5ff", border: "1px solid #f3e8ff" }}
                      >
                        <div className="text-xl mb-1">{f.icon}</div>
                        <div
                          className="text-xs font-medium mb-0.5"
                          style={{ color: "#374151" }}
                        >
                          {f.title}
                        </div>
                        <div
                          className="text-xs leading-snug"
                          style={{ color: "#9ca3af", fontSize: 10 }}
                        >
                          {f.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Modals ─── */}
      {showAddItem && (
        <AddItemModal
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
          color={active?.color || "#525252"}
        />
      )}
      {showNewCol && (
        <NewCollectionModal
          onAdd={addCollection}
          onClose={() => setShowNewCol(false)}
        />
      )}
      {showSignIn && (
        <SignInModal
          onSignIn={handleSignIn}
          onClose={() => setShowSignIn(false)}
        />
      )}
    </div>
  );
}
