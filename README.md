# EventPass

Event Ticketing & Check-in System — CSCD602 Advanced Software Engineering capstone (48-hour individual exam project).

## Structure
```
requirements-spec.md          Requirements & scope
data-model-api-design.md      Data model + REST API design
backend/                      Express + SQLite API
frontend/                     React (Vite) UI
```

## Running locally

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:4000

# Terminal 2
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Then open http://localhost:5173, register an account, create an event,
register a few attendees, and use the ticket codes on the `/checkin` screen.
Each attendee row also shows a QR code (encoding their ticket code) that can
be enlarged and printed from the event detail page.

## Testing

```bash
cd backend
npm test
```

Covers ticket-code uniqueness and the check-in duplicate-prevention rule,
including a concurrency test asserting only one of several simultaneous
check-in attempts against the same code succeeds. 7/7 passing as of the last
verified run.

## Known setup gotcha: better-sqlite3 on Node 24

`better-sqlite3` ships prebuilt native binaries per Node ABI version. If
`npm install` in `backend/` leaves you with a "Could not locate the bindings
file" error at runtime, it means no prebuilt binary exists yet for your
Node version and there's no local build toolchain to compile one. Two ways
out:
- Bump `better-sqlite3` to a version that does ship a prebuild for your
  Node version (this repo currently pins `^12.11.1`, which covers Node 24).
- Or install a Node LTS that the pinned version already supports.

If npm reports install scripts were "blocked because they are not covered
by allowScripts" for `better-sqlite3` or `esbuild`, that's npm's newer
install-script gate (npm ≥ 10.something) — run
`npm install-scripts approve <package>` in the relevant directory (`backend`
or `frontend`) to let the native/postinstall step actually run.
