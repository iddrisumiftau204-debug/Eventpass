# EventPass Frontend

React (Vite) frontend for the EventPass ticketing & check-in system.

## Setup

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

The dev server proxies `/api/*` requests to `http://localhost:4000`, so run the
backend (`cd ../backend && npm run dev`) alongside this.

## Pages

- `/login`, `/register` — auth
- `/` — event list + create event
- `/events/:id` — event detail: live stats, attendee registration form, attendee/ticket table
- `/checkin` — fast single-input check-in screen for event-day staff

## Notes

- Auth token is stored in `localStorage` and attached as `Authorization: Bearer <token>`.
- The check-in screen auto-focuses the input after every submission so staff
  can keep scanning/typing codes back-to-back without touching the mouse.
- Ticket codes are uppercased client-side before submission to match how
  they're generated on the backend.
- Each attendee's ticket code is also rendered as a QR code (`qrcode` npm
  package, generated client-side in `src/components/TicketQr.jsx` — the code
  is never sent anywhere to generate it, it's drawn straight to a canvas).
  Clicking the small thumbnail in the attendee table opens a modal with a
  larger version and a "Print ticket" button that isolates just that ticket
  for printing (see the `@media print` rules in `src/styles.css`).
