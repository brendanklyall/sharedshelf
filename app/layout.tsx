import type { Metadata } from "next";
import { Newsreader, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--mono",
});

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
    <html
      lang="en"
      className={`${newsreader.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
