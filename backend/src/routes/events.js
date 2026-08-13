const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /events - list organizer's events
router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE organizerId = ? ORDER BY date ASC').all(req.user.id);
  res.json(events);
});

// POST /events - create event
router.post('/', (req, res) => {
  const { name, date, venue, capacity } = req.body || {};
  if (!name || !date) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name and date are required' } });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO events (id, organizerId, name, date, venue, capacity) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, name, date, venue || null, capacity || null);

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  res.status(201).json(event);
});

function findOwnedEvent(eventId, organizerId) {
  return db.prepare('SELECT * FROM events WHERE id = ? AND organizerId = ?').get(eventId, organizerId);
}

// GET /events/:id - detail + stats
router.get('/:id', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const totalRegistered = db.prepare('SELECT COUNT(*) AS c FROM attendees WHERE eventId = ?').get(event.id).c;
  const totalCheckedIn = db.prepare('SELECT COUNT(*) AS c FROM attendees WHERE eventId = ? AND checkedIn = 1').get(event.id).c;

  res.json({
    ...event,
    stats: {
      totalRegistered,
      totalCheckedIn,
      checkedInPct: totalRegistered ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0,
    },
  });
});

// PUT /events/:id - update
router.put('/:id', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const { name, date, venue, capacity } = req.body || {};
  db.prepare('UPDATE events SET name = ?, date = ?, venue = ?, capacity = ? WHERE id = ?').run(
    name ?? event.name,
    date ?? event.date,
    venue ?? event.venue,
    capacity ?? event.capacity,
    event.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(event.id);
  res.json(updated);
});

// DELETE /events/:id
router.delete('/:id', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  db.prepare('DELETE FROM attendees WHERE eventId = ?').run(event.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(event.id);
  res.status(204).send();
});

module.exports = router;
