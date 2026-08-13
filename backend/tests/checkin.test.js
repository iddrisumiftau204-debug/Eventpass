process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../src/app');
const { registerAndLogin } = require('./testUtils');

describe('check-in flow', () => {
  let token;
  let eventId;
  let ticketCode;

  beforeAll(async () => {
    const auth = await registerAndLogin(app, request);
    token = auth.token;

    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Demo Conf', date: '2026-09-01', venue: 'Accra', capacity: 100 });
    eventId = eventRes.body.id;

    const attendeeRes = await request(app)
      .post(`/api/events/${eventId}/attendees`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Doe', email: 'jane@example.com' });
    ticketCode = attendeeRes.body.ticketCode;
  });

  test('a valid, unused ticket code checks in successfully', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketCode}/checkin`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('checked_in');
    expect(res.body.checkedInAt).toBeTruthy();
  });

  test('checking in the same code a second time is rejected with 409, not re-checked-in', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketCode}/checkin`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('already_checked_in');
    expect(res.body.checkedInAt).toBeTruthy();
  });

  test('an unknown ticket code returns 404', async () => {
    const res = await request(app)
      .post('/api/tickets/NOTAREAL/checkin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('concurrent check-in attempts on the same code only succeed once', async () => {
    // Register a fresh attendee for a clean ticket code
    const attendeeRes = await request(app)
      .post(`/api/events/${eventId}/attendees`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Race Condition', email: 'race@example.com' });
    const raceCode = attendeeRes.body.ticketCode;

    // Fire multiple check-in requests "simultaneously"
    const attempts = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app).post(`/api/tickets/${raceCode}/checkin`).set('Authorization', `Bearer ${token}`)
      )
    );

    const successes = attempts.filter((r) => r.status === 200);
    const conflicts = attempts.filter((r) => r.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(4);
  });

  test('duplicate registration to the same event with the same email is rejected', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/attendees`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Doe Again', email: 'jane@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });
});
