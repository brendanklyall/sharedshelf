import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#fafaf9", fontFamily: "var(--sans)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(250,250,249,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f1f0ee",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📚</span>
          <span
            className="font-semibold tracking-tight text-lg"
            style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
          >
            Shared Shelf
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs hidden sm:inline-block"
            style={{
              background: "#dbeafe",
              color: "#2563eb",
              fontFamily: "var(--mono)",
              fontSize: 10,
            }}
          >
            Built on AT Protocol
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-sm transition-colors"
            style={{ color: "#737373" }}
          >
            About
          </Link>
          <Link
            href="/shelf"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md"
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            Open Shelf →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="fade-in max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "#dbeafe",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              fontFamily: "var(--mono)",
            }}
          >
            <span>●</span> Built on AT Protocol · Sign in with Bluesky
          </div>

          <h1
            className="text-5xl sm:text-6xl font-semibold leading-tight mb-6"
            style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
          >
            Your collections.
            <br />
            <em>Your repo.</em>
          </h1>

          <p
            className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "#737373" }}
          >
            Shared Shelf lets you save, organize, and share curated collections
            of anything — books, restaurants, links, ideas — with your Bluesky
            network. Your data lives in your AT Protocol repository, not our
            database.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shelf?signin=1"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium transition-all hover:shadow-lg"
              style={{ background: "#0560ff", color: "#fff" }}
            >
              🦋 Sign in with Bluesky
            </Link>
            <Link
              href="/shelf"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium transition-all hover:shadow-md"
              style={{
                background: "#fff",
                color: "#1a1a1a",
                border: "1.5px solid #e5e5e5",
              }}
            >
              Try Demo →
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: "#a3a3a3" }}>
            Sign in to save to your AT Protocol PDS · No login needed for demo
          </p>
        </div>

        {/* Value props */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto w-full">
          {[
            {
              icon: "🏠",
              title: "User-owned data",
              desc: "Collections are Lexicon records stored in your AT Protocol data repository — not in our database. Move PDS, keep everything.",
            },
            {
              icon: "🔗",
              title: "Cross-app references",
              desc: "Items can reference any content in the Atmosphere via AT URIs — Bluesky posts, WhiteWind essays, Frontpage links, Smoke Signal events.",
            },
            {
              icon: "📋",
              title: "Custom Lexicons",
              desc: "social.sharedshelf.collection and social.sharedshelf.item are new data types living alongside Bluesky posts in your repo.",
            },
          ].map((prop, i) => (
            <div
              key={prop.title}
              className={`p-6 rounded-2xl text-left fade-in-delay-${i + 1}`}
              style={{
                background: "#fff",
                border: "1px solid #f1f0ee",
                opacity: 0,
              }}
            >
              <div className="text-3xl mb-3">{prop.icon}</div>
              <h3
                className="font-semibold text-sm mb-2"
                style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
              >
                {prop.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#737373" }}>
                {prop.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Protocol badge row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            "social.sharedshelf.collection",
            "social.sharedshelf.item",
            "app.bsky.feed.post",
            "at://",
          ].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                fontFamily: "var(--mono)",
                fontSize: 11,
                border: "1px solid #e2e8f0",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-6 text-center text-xs"
        style={{ color: "#a3a3a3", borderTop: "1px solid #f1f0ee" }}
      >
        Built on{" "}
        <a
          href="https://atproto.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "#2563eb" }}
        >
          AT Protocol
        </a>{" "}
        · Shared Shelf · Demo
      </footer>
    </main>
  );
}
