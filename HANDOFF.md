# BoxTrack — Handoff

QR box-inventory app for Fast Track (moving company). Customers scan a QR on
each box to see its contents; the crew log boxes during packing. This bundle is
a clean snapshot (no `node_modules`, no build output).

## Stack
- Next.js 16 (App Router) · React 19 · TypeScript
- Prisma 6 + SQLite (`prisma/dev.db`) — swap to Postgres for hosting
- Tailwind v4
- `qrcode` for sticker generation
- Runs on port 3005 (`npm run dev`)

## Run it
```
npm install
npx prisma generate
npm run dev        # http://localhost:3005
```
`.env` → `DATABASE_URL`. `.env.local` → `NEXT_PUBLIC_BASE_URL` (LAN address baked
into QR codes; change to your machine's IP for phone scanning).

## Architecture — two sides, separate but linked, no login

### Client side (what customers see — ops chrome hidden)
- `app/c/[moveId]/page.tsx` + `ClientInventory.tsx` — branded, read-only
  inventory: search, grouped by room, fragile flags, photos. Branded per market
  (name + accent colour). Accepts `?box=<id>` to highlight + scroll to a box.
- `app/b/[id]/page.tsx` — the QR sticker target. Resolves the box, then
  redirects to `/c/<moveId>?box=<boxId>`. A discreet "Crew · log this box" link
  on the client view deep-links crew to the logger during packing.

### Ops side
- `app/page.tsx` — all moves across both markets, market filter (`?m=AB|ON`),
  market badges, progress.
- `app/move/[id]/page.tsx` — move detail: add boxes, stickers, client view,
  photos, per-box list (each links to the logger).
- `app/move/[id]/log/[boxId]/page.tsx` + `BoxLogger.tsx` — fast tap-only packing
  logger (room, category, items, voice-to-text, photo, fill level, fragile).
- `app/move/[id]/stickers/page.tsx` — printable QR sheet, branded per market.
- `app/move/[id]/gallery/page.tsx` — condition photo gallery (claim shield).
- `app/dashboard/page.tsx` — move data (boxes by category, avg boxes by home
  size for quoting), with market badges.

### Branding / markets
- `lib/brand.ts` — `MARKETS` config: AB = Fast Track Movers (blue), ON = Fast
  Track Muskoka (teal). Drives company name + accent colour on client pages,
  badges, stickers.
- Each `Move` has a `market` field ("AB" | "ON", default "ON"). Migration
  `prisma/migrations/*_add_market` is already applied; existing moves default to
  Muskoka.
- `app/Brand.tsx` — market-aware `Logo`, `MarketWordmark`; neutral ops `Wordmark`.

## Data model (`prisma/schema.prisma`)
Move (clientName, market, fromAddr, toAddr, homeSize, moveDate, status) →
Box (id = QR nanoid, label, room, category, fragile, fillLevel, notes) →
Item (text), Photo (url). Cascade deletes.

## Suggested next steps for Claude Code
1. **Deploy for real, shareable links.** Vercel + hosted Postgres (Neon/Supabase).
   Switch `datasource db` provider to `postgresql`, set `DATABASE_URL`, set
   `NEXT_PUBLIC_BASE_URL` to the deployed origin so QR codes resolve publicly.
   Photos are stored as data-URL strings today — move to blob storage (e.g.
   Vercel Blob / S3) before production.
2. **"Copy client link" button** on the move page (text a customer their
   `/c/<moveId>` link).
3. Optional light gate on the ops side if it's ever publicly reachable
   (currently separated by URL only, by design).
4. Consider a per-box public read view if you want the QR to land on a single
   box rather than the full inventory.

## Note
A couple of legacy files are kept as inert redirects/stubs for backward
compatibility: `app/move/[id]/home/page.tsx` redirects to `/c/<id>`. Safe to
remove if not needed.
