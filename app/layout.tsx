import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Shelf — Your collections on AT Protocol",
  description:
    "A collaborative collections app built on AT Protocol. Save, organize, and share curated collections with your Bluesky network. Your data, your repo.",
  openGraph: {
    title: "Shared Shelf",
    description: "Your collections. Your repo. The entire Atmosphere.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
