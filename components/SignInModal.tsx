"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import type { ShelfSession } from "@/lib/auth";

interface SignInModalProps {
  onSignIn: (session: ShelfSession) => void;
  onClose: () => void;
}

export default function SignInModal({ onSignIn, onClose }: SignInModalProps) {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async () => {
    if (!handle.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Normalize handle — strip leading @
      const identifier = handle.trim().replace(/^@/, "");
      const session = await login(identifier, password);
      onSignIn(session);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("invalid")) {
        setError("Handle or app password is incorrect. Double-check and try again.");
      } else if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) {
        setError("Network error — check your connection and try again.");
      } else {
        setError("Sign in failed. Make sure you're using an App Password, not your account password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden fade-in-fast"
        style={{ background: "#fafaf9" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #f1f0ee" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🦋</span>
            <h3
              className="font-semibold text-base"
              style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
            >
              Sign in with Bluesky
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors hover:bg-stone-100"
            style={{ background: "#f5f5f4", color: "#737373" }}
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Explainer */}
          <p className="text-sm leading-relaxed" style={{ color: "#737373" }}>
            Sign in to save your collections directly to your AT Protocol
            repository — your data lives on <em>your</em> PDS, not our servers.
          </p>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#525252" }}
              >
                Bluesky handle
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="yourname.bsky.social"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                }}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-medium"
                  style={{ color: "#525252" }}
                >
                  App Password
                </label>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-xs underline"
                  style={{ color: "#2563eb" }}
                >
                  {showGuide ? "Hide guide" : "How do I get one?"}
                </button>
              </div>

              {showGuide && (
                <div
                  className="mb-2 p-3 rounded-xl text-xs leading-relaxed space-y-1"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                    color: "#92400e",
                  }}
                >
                  <p className="font-medium">How to create an App Password:</p>
                  <ol className="space-y-0.5 pl-4 list-decimal">
                    <li>
                      Go to{" "}
                      <a
                        href="https://bsky.app/settings/app-passwords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: "#2563eb" }}
                      >
                        bsky.app/settings/app-passwords
                      </a>
                    </li>
                    <li>Click &ldquo;Add App Password&rdquo;</li>
                    <li>Name it &ldquo;Shared Shelf&rdquo;</li>
                    <li>Copy the generated password and paste it below</li>
                  </ol>
                  <p className="mt-1" style={{ color: "#a16207" }}>
                    App Passwords are safe — they can&apos;t change your account
                    settings or password.
                  </p>
                </div>
              )}

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  letterSpacing: "0.05em",
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {/* AT Protocol badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              color: "#1e40af",
            }}
          >
            <span
              className="px-1.5 py-0.5 rounded font-medium flex-shrink-0"
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                fontFamily: "var(--mono)",
                fontSize: 9,
              }}
            >
              at://
            </span>
            Your collections will be written to your own PDS as{" "}
            <code
              style={{
                fontFamily: "var(--mono)",
                background: "#dbeafe",
                padding: "1px 4px",
                borderRadius: 3,
              }}
            >
              social.sharedshelf.collection
            </code>{" "}
            records.
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
            Stay in demo
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !handle.trim() || !password.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md flex items-center gap-2"
            style={{ background: "#0560ff", color: "#fff" }}
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
