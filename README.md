# BoxTrack

QR box inventory for moves. Stick a QR code on each box, scan it with a phone,
log what's inside in ~5 seconds (tap room, tap category, snap photo, voice note).

Built for in-house use by the moving company: a premium packing differentiator,
a damage-claim shield (timestamped photo + contents per box), and, over time, a
dataset for tighter quotes.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma 6 + SQLite (`prisma/dev.db`) — swap to Postgres for production
- `qrcode` for sticker generation, Web Speech API for voice notes

## Run it

```bash
npm run dev -- -H 0.0.0.0
```

Open http://localhost:3000 on the laptop.

### Scanning from a phone (same Wi-Fi)

The QR codes encode an absolute URL, so they must point at this machine's LAN
address, not `localhost`. Set it before generating stickers:

1. Create `.env.local` with your LAN IP:
   ```
   NEXT_PUBLIC_BASE_URL=http://192.168.68.68:3000
   ```
2. Restart the dev server.
3. On the phone (same Wi-Fi), open `http://192.168.68.68:3000` once to confirm
   it loads, then scan a printed sticker.

(IP detected on this machine: **192.168.68.68**. It can change — re-check with
`ipconfig` if scanning stops working.)

## Flow

1. **New move** → enter client + home size.
2. **+ Box / +10** → creates blank boxes with sequential numbers.
3. **Print stickers** → QR sheet, one per box. Print, cut, stick.
4. **Scan a box** → log screen: tap Room, tap Category, 📷 photo, 🎤 voice note,
   fill level, Fragile. Everything auto-saves.
5. Move dashboard shows logged/total and a ✓ per finished box.

## Data model

`Move` → many `Box` (id = the QR code) → many `Photo`. See `prisma/schema.prisma`.

## Not built yet (Phase 2+)

- Client-facing read-only home view + "where's my X" search
- Aggregate quoting dashboard (avg boxes by home size, category mix) — build once
  there are 30+ real moves logged
- Auth / multi-crew accounts
- Object storage for photos (currently `/public/uploads`)
