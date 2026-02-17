import Link from "next/link";

export const metadata = {
  title: "About — Shared Shelf",
  description: "About Shared Shelf, created by Brendan Lyall",
};

export default function AboutPage() {
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
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-xl">📚</span>
          <span
            className="font-semibold tracking-tight text-lg"
            style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
          >
            Shared Shelf
          </span>
        </Link>
        <Link
          href="/shelf"
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          Open Shelf →
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full fade-in">
          <p
            className="text-xs font-medium tracking-widest mb-6"
            style={{ color: "#a3a3a3" }}
          >
            ABOUT
          </p>
          <h1
            className="text-4xl font-semibold leading-tight mb-6"
            style={{ fontFamily: "var(--serif)", color: "#1a1a1a" }}
          >
            A personal shelf for the things that matter.
          </h1>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: "#525252" }}
          >
            Shared Shelf was created by{" "}
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>Brendan Lyall</span>{" "}
            as a personal tool for staying organized and keeping track of the
            topics, ideas, and discoveries worth remembering. Whether it&apos;s a
            book that shifted a perspective, a restaurant worth revisiting, an
            article to reference later, or just something fun and interesting —
            Shared Shelf is the place to note it, track it, and share it.
          </p>
          <p
            className="text-base leading-relaxed"
            style={{ color: "#525252" }}
          >
            Built on AT Protocol, so the collections always stay yours.
          </p>

          <div
            className="mt-10 pt-8"
            style={{ borderTop: "1px solid #f1f0ee" }}
          >
            <Link
              href="/shelf"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: "#2563eb" }}
            >
              Browse the shelf →
            </Link>
          </div>
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
        · Shared Shelf · Brendan Lyall
      </footer>
    </main>
  );
}
