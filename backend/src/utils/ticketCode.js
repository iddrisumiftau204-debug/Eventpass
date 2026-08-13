// Human-typeable ticket codes: uppercase base32-ish alphabet, no ambiguous chars (0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 7;

function randomCode(length = CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Generates a ticket code guaranteed unique against the DB at generation time.
 * @param {import('better-sqlite3').Database} db
 * @returns {string}
 */
function generateUniqueTicketCode(db) {
  const exists = db.prepare('SELECT 1 FROM attendees WHERE ticketCode = ?');
  let code;
  let attempts = 0;
  do {
    code = randomCode();
    attempts++;
    if (attempts > 20) {
      throw new Error('Failed to generate a unique ticket code after 20 attempts');
    }
  } while (exists.get(code));
  return code;
}

module.exports = { generateUniqueTicketCode, randomCode };
