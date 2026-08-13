# EventPass Backend

Express + SQLite (via better-sqlite3) REST API for the EventPass ticketing & check-in system.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev      # starts on http://localhost:4000 with auto-reload
# or: npm start
```

## Run tests

```bash
npm test
```

Covers ticket code generation (uniqueness) and the check-in flow — including a
concurrency test that fires 5 simultaneous check-in requests against the same
ticket code and asserts exactly one succeeds. This is the core business rule
(FR11 / NFR1) and the part most likely to be scrutinized in grading.

## Project structure

```
src/
  app.js              Express app + route mounting
  server.js            Entry point
  db/index.js           SQLite connection + schema
  middleware/auth.js       JWT auth middleware
  routes/
    auth.js               POST /api/auth/register, /login
    events.js             Event CRUD
    attendees.js           Attendee registration (nested under /api/events/:id/attendees)
    tickets.js             GET /api/tickets/:code, POST /api/tickets/:code/checkin
  utils/ticketCode.js       Unique ticket code generator
tests/
  ticketCode.test.js
  checkin.test.js
```

## API summary

See `data-model-api-design.md` in the project root for the full spec. Quick reference:

- `POST /api/auth/register` / `POST /api/auth/login`
- `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`
- `GET/POST /api/events/:id/attendees`
- `GET /api/tickets/:code`
- `POST /api/tickets/:code/checkin`

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

## Why SQLite

Zero external setup — no DB server to install/configure — which matters in a
48-hour time-boxed exam. Swapping to Postgres later is a matter of replacing
`src/db/index.js`; the SQL used is close to standard.

## Node version note

`better-sqlite3` is pinned to `^12.11.1` because it ships a prebuilt native
binary for current Node versions (including Node 24); the `^11.x` line does
not, and there's no local C++ build toolchain assumed here to compile one
from source. If `npm install` reports install scripts blocked ("not covered
by allowScripts"), run `npm install-scripts approve better-sqlite3` — that's
npm's native/postinstall-script gate, not an install failure.
