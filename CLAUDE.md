# Shared Shelf

## What is this?
A collections app on AT Protocol. Users curate and share collections of anything
(books, restaurants, links, ideas). Items reference any AT URI in the Atmosphere.

## Key packages
- `@atproto/api` — Bluesky/AT Protocol SDK (AT URI resolution, public API)
- `next` — App Router, API routes
- `tailwindcss` — Styling

## Architecture
- **Demo mode** — React state with sample data, no backend, no auth needed
- Collections = custom Lexicon records (`social.sharedshelf.collection`)
- Items = custom Lexicon records (`social.sharedshelf.item`)
- Cross-app refs via AT URIs resolved through public Bluesky API
- Bluesky post search via public API (`public.api.bsky.app`, no auth)

## File layout
```
app/
  page.tsx           — Landing page (marketing, "Try Demo" CTA)
  shelf/page.tsx     — Main shelf view
  api/resolve/       — AT URI resolution proxy (avoids CORS)
components/
  ShelfApp.tsx       — Main app shell (state, layout, routing)
  CollectionCard.tsx — Sidebar collection button with delete
  ItemCard.tsx       — Item display with expand/collapse
  AddItemModal.tsx   — Add item (manual + Bluesky import tabs)
  NewCollectionModal.tsx — Create collection with templates
  StarRating.tsx     — 5-star rating component
  Tag.tsx            — Colored tag pill
  LexiconViewer.tsx  — Protocol tab: Lexicon schema viewer
  CrossAppPanel.tsx  — Protocol tab: Atmosphere app interop
lib/
  atproto.ts         — AT Protocol public API helpers
  lexicons.ts        — Lexicon schemas + Atmosphere app list
  sample-data.ts     — Pre-populated demo collections
  types.ts           — Shared TypeScript types
lexicons/
  social.sharedshelf.collection.json
  social.sharedshelf.item.json
```

## Important constraints
- All user data conceptually lives in the user's PDS, not our DB
- Public reads use `public.api.bsky.app/xrpc` (no auth needed)
- AT URIs: `at://did/collection/rkey`
- Demo mode must work without any auth or external services
- Design: warm editorial aesthetic (Newsreader serif, Outfit sans, JetBrains Mono)
- NO dark mode — light theme only

## Coding standards
- TypeScript strict mode
- All interactive components use `"use client"`
- Server components for pages, client components for interactivity
- Error handling for API failures with graceful fallbacks
