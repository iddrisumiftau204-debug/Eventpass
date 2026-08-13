const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../eventpass.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organizerId TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  venue TEXT,
  capacity INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  ticketCode TEXT NOT NULL UNIQUE,
  checkedIn INTEGER NOT NULL DEFAULT 0,
  checkedInAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (eventId) REFERENCES events(id),
  UNIQUE (eventId, email)
);

CREATE INDEX IF NOT EXISTS idx_attendees_ticketCode ON attendees(ticketCode);
CREATE INDEX IF NOT EXISTS idx_attendees_eventId ON attendees(eventId);
CREATE INDEX IF NOT EXISTS idx_events_organizerId ON events(organizerId);
`);

module.exports = db;
