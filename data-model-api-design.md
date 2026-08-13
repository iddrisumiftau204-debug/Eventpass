# EventPass — Data Model & API Design

This documents the schema and REST API as actually implemented in
`backend/src`. It's a reference, not a proposal — if it and the code
ever disagree, the code wins and this file is stale.

## Data model

SQLite (via `better-sqlite3`), schema created at startup in
[backend/src/db/index.js](backend/src/db/index.js). Four entities: `users`,
`events`, `attendees`, and implicitly "tickets" — a ticket is not a
separate row, it's the `ticketCode`/`checkedIn`/`checkedInAt` columns on
an `attendees` row.

### `users`

| Column         | Type | Notes                          |
|----------------|------|---------------------------------|
| `id`           | TEXT | UUID v4, primary key            |
| `name`         | TEXT | required                        |
| `email`        | TEXT | required, unique                |
| `passwordHash` | TEXT | bcrypt, 10 rounds                |
| `createdAt`    | TEXT | ISO-ish, defaults to `datetime('now')` |

A "user" is an event organizer. There is no separate attendee login —
attendees never authenticate; they're just rows an organizer creates.

### `events`

| Column        | Type    | Notes                                   |
|---------------|---------|-------------------------------------------|
| `id`          | TEXT    | UUID v4, primary key                      |
| `organizerId` | TEXT    | FK → `users.id`                           |
| `name`        | TEXT    | required                                  |
| `date`        | TEXT    | required, free-form (frontend sends `datetime-local`) |
| `venue`       | TEXT    | optional                                  |
| `capacity`    | INTEGER | optional, not enforced anywhere yet       |
| `createdAt`   | TEXT    | defaults to `datetime('now')`             |

`capacity` is stored but not currently checked against attendee count —
you can register more attendees than capacity. No error, no warning.

### `attendees`

| Column        | Type    | Notes                                              |
|---------------|---------|-------------------------------------------------------|
| `id`          | TEXT    | UUID v4, primary key                                  |
| `eventId`     | TEXT    | FK → `events.id`                                      |
| `name`        | TEXT    | required                                              |
| `email`       | TEXT    | required                                              |
| `ticketCode`  | TEXT    | unique across the whole table (not just per event), 7 chars |
| `checkedIn`   | INTEGER | 0/1, defaults 0                                        |
| `checkedInAt` | TEXT    | null until checked in                                  |
| `createdAt`   | TEXT    | defaults to `datetime('now')`                          |

Constraints: `UNIQUE(ticketCode)` and `UNIQUE(eventId, email)` — the
same email can register for two different events, but not twice for
the same one.

Indexes: `ticketCode` and `eventId` on `attendees`, `organizerId` on
`events` — the three columns everything is looked up by.

### Ticket codes

Generated in [backend/src/utils/ticketCode.js](backend/src/utils/ticketCode.js):
7 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — uppercase,
digits, with `0/O` and `1/I` excluded to avoid transcription errors
when someone reads a code aloud or types it at a check-in desk.
Generation retries against the DB until it finds an unused code (up to
20 attempts, then throws — at this alphabet size and code length the
collision probability is negligible for any realistic attendee count).

### QR codes

Not a stored column — the frontend generates a QR code client-side
(via the `qrcode` npm package) that simply encodes the `ticketCode`
string. Scanning it and typing the code by hand produce the same
value. See `frontend/src/components/TicketQr.jsx`.

## Auth

JWT, signed with `JWT_SECRET` (env var, falls back to a hardcoded dev
value if unset — **do not rely on that fallback outside local dev**).
Token payload: `{ id, email }`, 12h expiry. Sent as
`Authorization: Bearer <token>`, checked by
[backend/src/middleware/auth.js](backend/src/middleware/auth.js) on every
route except `/api/auth/*`.

There is one role: organizer. Every event/attendee/ticket route scopes
its query to `WHERE organizerId = req.user.id` (or through the
event's organizer for attendees/tickets), so organizers can't see or
touch each other's data. There is no admin role and no attendee-facing
auth.

## API

Base path: `/api`. All bodies are JSON. Errors are
`{ "error": { "code": "SOME_CODE", "message": "human text" } }` with
an appropriate HTTP status.

### Auth

| Method | Path                | Auth | Body                          | Success | Notes |
|--------|---------------------|------|--------------------------------|---------|-------|
| POST   | `/auth/register`    | none | `{ name, email, password }`    | 201, `{ user, token }` | 409 `DUPLICATE_EMAIL` if the email is taken |
| POST   | `/auth/login`       | none | `{ email, password }`          | 200, `{ user, token }` | 401 `UNAUTHORIZED` on bad credentials (same message for wrong email vs wrong password — doesn't leak which) |

### Events

All require `Authorization: Bearer <token>`; every handler scopes to
the caller's own events (`organizerId = req.user.id`).

| Method | Path            | Body                                    | Success | Notes |
|--------|-----------------|-------------------------------------------|---------|-------|
| GET    | `/events`       | —                                          | 200, `Event[]` ordered by `date ASC` | |
| POST   | `/events`       | `{ name, date, venue?, capacity? }`       | 201, `Event` | 400 if `name`/`date` missing |
| GET    | `/events/:id`   | —                                          | 200, `Event & { stats }` | 404 if not found / not yours |
| PUT    | `/events/:id`   | any subset of `{ name, date, venue, capacity }` | 200, updated `Event` | unspecified fields keep their current value |
| DELETE | `/events/:id`   | —                                          | 204 | cascades: deletes the event's attendees first, then the event |

`stats` on `GET /events/:id`:
```json
{ "totalRegistered": 12, "totalCheckedIn": 5, "checkedInPct": 42 }
```
`checkedInPct` is `round(checkedIn / registered * 100)`, or `0` if
nobody's registered (avoids a divide-by-zero).

### Attendees

Nested under an event; all require auth and event ownership.

| Method | Path                        | Body                    | Success | Notes |
|--------|-----------------------------|--------------------------|---------|-------|
| GET    | `/events/:id/attendees`     | —                        | 200, `Attendee[]` ordered by `createdAt ASC` | 404 if event not found/not yours |
| POST   | `/events/:id/attendees`     | `{ name, email }`        | 201, `Attendee` (includes generated `ticketCode`) | 400 if `name`/`email` missing; 409 `DUPLICATE_EMAIL` if that email is already registered for *this* event |

### Tickets

Also require auth (this is a staff-facing scanning tool, not public).

| Method | Path                        | Body | Success | Notes |
|--------|-----------------------------|------|---------|-------|
| GET    | `/tickets/:code`            | —    | 200, attendee row joined with `eventName`/`eventDate` | 404 `NOT_FOUND` if code doesn't exist. Read-only — does not check in. |
| POST   | `/tickets/:code/checkin`    | —    | 200, `{ status: "checked_in", checkedInAt, attendee }` | See below |

Check-in response shapes:
- **First check-in** → `200 { status: "checked_in", checkedInAt, attendee }`
- **Already checked in** → `409 { status: "already_checked_in", checkedInAt, attendee }`
- **Unknown code** → `404 { error: { code: "NOT_FOUND", ... } }`

#### Concurrency

The check-in endpoint is the one place this project treats correctness
as non-negotiable: two staff members scanning the same badge at the
same instant must not both succeed. This is done with a single atomic
conditional `UPDATE`:

```sql
UPDATE attendees
SET checkedIn = 1, checkedInAt = datetime('now')
WHERE ticketCode = ? AND checkedIn = 0
```

`result.changes` is `1` for exactly one of any number of concurrent
callers — SQLite serializes writes, so there's no read-then-write race
window. Every other concurrent caller gets `changes === 0`, at which
point the handler does a follow-up `SELECT` to decide between "already
checked in" (409) and "doesn't exist" (404). This is exercised directly
in [backend/tests/checkin.test.js](backend/tests/checkin.test.js), which
fires 5 simultaneous check-in requests at the same code and asserts
exactly 1 succeeds.

### Errors

Every 4xx/5xx body follows the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "name and date are required" } }
```

Codes in use: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401),
`DUPLICATE_EMAIL` (409), `NOT_FOUND` (404), `INTERNAL_ERROR` (500,
central error handler catch-all in `app.js`). A 404 with no JSON body
also occurs for routes that don't exist at all (the app-level fallback).
