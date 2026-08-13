const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /tickets/:code - look up a ticket (does not check in)
router.get('/:code', (req, res) => {
  const row = db.prepare(`
    SELECT a.*, e.name AS eventName, e.date AS eventDate
    FROM attendees a
    JOIN events e ON e.id = a.eventId
    WHERE a.ticketCode = ?
  `).get(req.params.code);

  if (!row) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
  }

  res.json(row);
});

// POST /tickets/:code/checkin - atomic check-in, safe under concurrent requests
router.post('/:code/checkin', (req, res) => {
  const code = req.params.code;

  // Single atomic conditional update: only succeeds if checkedIn was still 0.
  // This avoids the read-then-write race where two simultaneous scans of the
  // same code could both pass a separate "is it checked in?" read.
  const result = db.prepare(`
    UPDATE attendees
    SET checkedIn = 1, checkedInAt = datetime('now')
    WHERE ticketCode = ? AND checkedIn = 0
  `).run(code);

  if (result.changes === 1) {
    const attendee = db.prepare('SELECT * FROM attendees WHERE ticketCode = ?').get(code);
    return res.json({ status: 'checked_in', checkedInAt: attendee.checkedInAt, attendee });
  }

  // Either already checked in, or the code doesn't exist at all - distinguish them.
  const existing = db.prepare('SELECT * FROM attendees WHERE ticketCode = ?').get(code);
  if (!existing) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
  }

  return res.status(409).json({
    status: 'already_checked_in',
    checkedInAt: existing.checkedInAt,
    attendee: existing,
  });
});

module.exports = router;
