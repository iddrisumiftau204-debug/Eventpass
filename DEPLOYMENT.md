# Deploying EventPass

Two independent services, defined as a [Render](https://render.com)
Blueprint in [render.yaml](render.yaml):

- **`eventpass-api`** — the Express backend, with a small persistent
  disk mounted for the SQLite file.
- **`eventpass-web`** — the React (Vite) frontend, built as a static
  site and pointed at the backend's URL via `VITE_API_BASE_URL`.

This file covers the steps that need *your* GitHub/Render accounts —
I (the assistant) installed Git locally, wired the frontend to accept
a configurable API URL, and wrote `render.yaml`, but pushing code to
your GitHub and creating services in your Render account are actions
only you can authorize.

## 1. Push this repo to GitHub

The local repo has already been initialized with a first commit. Create
an empty repository on GitHub (no README/license — this repo already
has files), then from `C:\Users\User\Desktop\eventpass`:

```powershell
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

## 2. Create the Blueprint on Render

1. Sign in at [dashboard.render.com](https://dashboard.render.com),
   connect your GitHub account if you haven't.
2. **New +** → **Blueprint** → select the repo you just pushed.
   Render reads `render.yaml` and shows both services
   (`eventpass-api`, `eventpass-web`) for review.
3. Click **Apply**. `JWT_SECRET` is auto-generated (via
   `generateValue: true` in the blueprint) — you never need to type a
   secret in by hand.

## 3. Verify the backend's URL matches the frontend's config

Render service names are global across all Render users, so if
`eventpass-api` is already taken, Render will assign your service a
different hostname (e.g. `eventpass-api-ab12.onrender.com`) instead of
the plain one `render.yaml` assumed for `VITE_API_BASE_URL`.

After the first deploy, open the `eventpass-api` service page and
check its URL at the top. If it doesn't match
`https://eventpass-api.onrender.com` exactly:

1. Open the `eventpass-web` service → **Environment** tab.
2. Edit `VITE_API_BASE_URL` to `https://<actual-api-hostname>/api`.
3. Trigger a manual redeploy of `eventpass-web` (env vars for a
   static site are baked in at build time, so just saving the
   variable isn't enough — it needs a rebuild).

## 4. Smoke test

Visit the `eventpass-web` URL, register an account, create an event,
register an attendee, and check them in. If the register/login calls
fail with a network error in the browser console, it's almost always
step 3 above (URL mismatch) — check the browser's Network tab for
what host the failed request actually went to.

## Known constraints, read before applying the Blueprint

- **Persistent disks require a paid plan.** `render.yaml` requests
  `plan: starter` for `eventpass-api` specifically because free-tier
  web services on Render don't support an attached disk — without one,
  the SQLite file lives on ephemeral storage and gets wiped on every
  redeploy/restart. Render restructured its plan tiers in **April
  2026**, close to my knowledge cutoff, so double-check the current
  plan name and price for disk support in the dashboard before you
  click Apply — `starter` may or may not still be the right tier by
  the time you deploy.
- **The frontend (`eventpass-web`) is genuinely free** — static sites
  don't need a disk or a paid plan.
- **CORS is already wide open** (`app.use(cors())` with no options in
  `backend/src/app.js` allows any origin), so no CORS configuration
  is needed for the cross-origin frontend → backend calls this
  two-service split requires. That was already the case before this
  deploy work — not something added for it.
- **`better-sqlite3` native binary.** Render builds on Linux, so it
  needs its own prebuilt binary for that platform (separate from the
  Windows one this project needed locally — see `backend/README.md`).
  This should resolve automatically via `npm install`, same as it did
  locally, but if the Render build log shows a "bindings file" error,
  that's the first place to look.
- **If you'd rather not pay for a disk at all**, the alternative is
  swapping SQLite for Render's free-tier Postgres and updating
  `backend/src/db/index.js` plus the two `better-sqlite3` call sites —
  a real code change, not a config one, so it wasn't done here without
  you asking for it.
