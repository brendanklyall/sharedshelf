import { Suspense } from "react";
import ShelfApp from "@/components/ShelfApp";

export const metadata = {
  title: "My Shelf — Shared Shelf",
  description: "Your curated collections on AT Protocol",
};

export default function ShelfPage() {
  return (
    <Suspense>
      <ShelfApp />
    </Suspense>
  );
}
