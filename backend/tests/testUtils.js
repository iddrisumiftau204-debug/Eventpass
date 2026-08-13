const path = require('path');
const fs = require('fs');

// Use a throwaway file-based DB per test run (better-sqlite3 needs a real file
// or ':memory:'; ':memory:' is simplest and fully isolated per require).
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

// Because src/db/index.js is a singleton module, re-require it fresh isn't
// trivial across files in the same Jest worker, but each test file gets its
// own module registry in Jest by default, so this is safe.

async function registerAndLogin(app, request, overrides = {}) {
  const user = {
    name: 'Test Organizer',
    email: overrides.email || `organizer_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
    password: 'password123',
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { token: res.body.token, user: res.body.user };
}

module.exports = { registerAndLogin };
