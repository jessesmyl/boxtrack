# Deploying BoxTrack to Railway

Goal: move BoxTrack off the laptop onto a real always-on server with a branded
domain, so crew and clients can rely on it (and phone voice + scanning work over
real https). Hosting: **Railway** (app + managed Postgres + a photo volume).

Everything in code is ready. These are the steps that need your account + billing.

---

## 0. One-time accounts

- A [GitHub](https://github.com) account (free) — Railway deploys from a repo.
- A [Railway](https://railway.app) account (~$5/mo Hobby plan).
- A domain registrar account (Cloudflare, Namecheap, Porkbun) for the branded domain.

---

## 1. Push the code to GitHub

The repo is already initialized locally. Create an empty repo on GitHub (no
README), then from `boxtrack/`:

```bash
git remote add origin https://github.com/<you>/boxtrack.git
git branch -M main
git push -u origin main
```

`.env*`, the local SQLite db, and uploaded photos are git-ignored, so no secrets
or test data get pushed.

---

## 2. Create the Railway project + Postgres

1. Railway → **New Project** → **Deploy from GitHub repo** → pick `boxtrack`.
2. In the project, **New** → **Database** → **Add PostgreSQL**. Railway creates
   it and injects a `DATABASE_URL` variable into your app automatically.
3. On the app service → **Variables**, confirm `DATABASE_URL` is referenced
   (Railway uses `${{Postgres.DATABASE_URL}}`). Add:
   - `NEXT_PUBLIC_BASE_URL` = `https://YOUR-DOMAIN` (set this after step 5; use the
     temporary `*.up.railway.app` URL for now).

Don't deploy successfully yet — the schema is still SQLite. Do step 3 first.

---

## 3. Switch the database to Postgres (verified, run against the real DB)

This is the one code change left, done against the live Railway Postgres so we
know it works before relying on it.

1. In Railway, open the **Postgres** service → **Connect** → copy the
   **Public** connection string.
2. Locally, put it in `boxtrack/.env`:
   ```
   DATABASE_URL="postgresql://...the public URL..."
   ```
3. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Replace the old SQLite migration with a fresh Postgres one and apply it:
   ```bash
   rm -rf prisma/migrations
   npx prisma migrate dev --name init
   ```
   This creates the tables in the Railway Postgres and writes a Postgres
   migration file. (Your local app now talks to Postgres too — the old SQLite
   test data is left behind, which is fine.)
5. Commit and push:
   ```bash
   git add -A && git commit -m "Switch to Postgres for production"
   git push
   ```
   Railway redeploys. On boot, `npm start` runs `prisma migrate deploy` (applies
   migrations) then `next start`. The build runs `prisma generate` automatically.

---

## 4. Add a volume so box photos survive restarts

Photos are your damage-claim evidence, so they must persist across deploys.

1. App service → **Settings** → **Volumes** → **New Volume**.
2. Mount path: `/app/public/uploads`
3. Redeploy. Uploaded photos now live on the volume and survive restarts.

> Photos are written to `public/uploads` at runtime and served by `next start`
> from disk, so mounting the volume there is all that's needed — no code change.

---

## 5. Point your branded domain at it

1. Buy the domain (e.g. `boxtrack.app`, `fasttrackboxes.com`).
2. Railway app service → **Settings** → **Networking** → **Custom Domain** →
   enter `track.yourdomain.com` (a subdomain is cleanest).
3. Railway shows a `CNAME` target. Add that CNAME record at your registrar.
4. Once it goes green, update the `NEXT_PUBLIC_BASE_URL` variable to
   `https://track.yourdomain.com` and redeploy. This makes QR stickers and
   client links encode the real domain.

---

## 6. Verify

- Open `https://track.yourdomain.com` → create a test move → add boxes.
- **Stickers** page → the QR now encodes `https://track.yourdomain.com/b/<id>`.
- Scan one with a phone → lands on the client inventory with that box highlighted.
- On a box log screen, the **🎤 Speak to add an item** button now works on the
  phone (real https = secure context).
- Move dashboard → **Send client their inventory** → opens the phone share sheet.

---

## Notes

- **Backups:** Railway Postgres has automated backups on paid plans — verify
  they're on. The volume (photos) should be backed up separately; Railway can
  snapshot volumes.
- **Local dev after the switch:** you now need a Postgres `DATABASE_URL`. Either
  keep pointing `.env` at the Railway Postgres, or run Postgres locally with
  Docker Desktop. The Cloudflare tunnel + SQLite setup was only ever a stopgap.
- **Two markets:** `NEXT_PUBLIC_BASE_URL` is one domain; both Fast Track markets
  run off it, differentiated per-move by the `market` field. No extra config.
