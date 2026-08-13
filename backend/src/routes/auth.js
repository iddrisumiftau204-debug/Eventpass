const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '12h' }
  );
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name, email, and password are required' } });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' } });
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (id, name, email, passwordHash) VALUES (?, ?, ?, ?)').run(id, name, email, passwordHash);

  const user = { id, name, email };
  return res.status(201).json({ user, token: sign(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email and password are required' } });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
  }

  const match = await bcrypt.compare(password, row.passwordHash);
  if (!match) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
  }

  const user = { id: row.id, name: row.name, email: row.email };
  return res.json({ user, token: sign(user) });
});

module.exports = router;
