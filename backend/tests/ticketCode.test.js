process.env.DB_PATH = ':memory:';
const db = require('../src/db');
const { generateUniqueTicketCode, randomCode } = require('../src/utils/ticketCode');

describe('ticket code generation', () => {
  test('generates a code of the expected shape', () => {
    const code = randomCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{7}$/); // no 0/O/1/I
  });

  test('generateUniqueTicketCode never returns a code already in the DB', () => {
    // Seed a user + event to satisfy foreign keys
    db.prepare("INSERT INTO users (id, name, email, passwordHash) VALUES ('u1','U','u1@example.com','x')").run();
    db.prepare("INSERT INTO events (id, organizerId, name, date) VALUES ('e1','u1','Test Event','2026-01-01')").run();

    const taken = generateUniqueTicketCode(db);
    db.prepare(
      "INSERT INTO attendees (id, eventId, name, email, ticketCode) VALUES ('a1','e1','A','a@example.com',?)"
    ).run(taken);

    // Generate many more codes and confirm none collide with the taken one,
    // and each generated code is unique among itself.
    const seen = new Set([taken]);
    for (let i = 0; i < 50; i++) {
      const code = generateUniqueTicketCode(db);
      expect(seen.has(code)).toBe(false);
      seen.add(code);
      db.prepare(
        "INSERT INTO attendees (id, eventId, name, email, ticketCode) VALUES (?,?,?,?,?)"
      ).run(`a-${i}`, 'e1', `Name ${i}`, `a${i}@example.com`, code);
    }
  });
});
