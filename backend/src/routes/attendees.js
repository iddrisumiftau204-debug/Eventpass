const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { generateUniqueTicketCode } = require('../utils/ticketCode');

// mergeParams so we can read :id (eventId) from the parent /events router mount
const router = express.Router({ mergeParams: true });
router.use(requireAuth);

function findOwnedEvent(eventId, organizerId) {
  return db.prepare('SELECT * FROM events WHERE id = ? AND organizerId = ?').get(eventId, organizerId);
}

// GET /events/:id/attendees
router.get('/', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const attendees = db.prepare('SELECT * FROM attendees WHERE eventId = ? ORDER BY createdAt ASC').all(event.id);
  res.json(attendees);
});

// POST /events/:id/attendees
router.post('/', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name and email are required' } });
  }

  const dup = db.prepare('SELECT id FROM attendees WHERE eventId = ? AND email = ?').get(event.id, email);
  if (dup) {
    return res.status(409).json({ error: { code: 'DUPLICATE_EMAIL', message: 'This email is already registered for this event' } });
  }

  const id = uuidv4();
  const ticketCode = generateUniqueTicketCode(db);

  db.prepare('INSERT INTO attendees (id, eventId, name, email, ticketCode) VALUES (?, ?, ?, ?, ?)')
    .run(id, event.id, name, email, ticketCode);

  const attendee = db.prepare('SELECT * FROM attendees WHERE id = ?').get(id);
  res.status(201).json(attendee);
});

// PUT /events/:id/attendees/:attendeeId - update attendee
router.put('/:attendeeId', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const attendee = db.prepare('SELECT * FROM attendees WHERE id = ? AND eventId = ?').get(req.params.attendeeId, event.id);
  if (!attendee) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attendee not found' } });
  }

  const { name, email } = req.body || {};
  db.prepare('UPDATE attendees SET name = ?, email = ? WHERE id = ?').run(
    name ?? attendee.name,
    email ?? attendee.email,
    attendee.id
  );

  const updated = db.prepare('SELECT * FROM attendees WHERE id = ?').get(attendee.id);
  res.json(updated);
});

// DELETE /events/:id/attendees/:attendeeId
router.delete('/:attendeeId', (req, res) => {
  const event = findOwnedEvent(req.params.id, req.user.id);
  if (!event) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  const attendee = db.prepare('SELECT * FROM attendees WHERE id = ? AND eventId = ?').get(req.params.attendeeId, event.id);
  if (!attendee) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attendee not found' } });
  }

  db.prepare('DELETE FROM attendees WHERE id = ?').run(attendee.id);
  res.status(204).send();
});

module.exports = router;
