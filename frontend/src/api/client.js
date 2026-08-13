// In local dev this stays '/api' and Vite's proxy (vite.config.js) forwards
// it to the backend. In production, the frontend and backend are deployed
// as separate services on different origins, so VITE_API_BASE_URL points
// straight at the deployed backend's /api path.
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('eventpass_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body (e.g. 204)
  }

  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.code = data?.error?.code;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  listEvents: () => request('/events'),
  createEvent: (payload) => request('/events', { method: 'POST', body: payload }),
  getEvent: (id) => request(`/events/${id}`),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: payload }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  listAttendees: (eventId) => request(`/events/${eventId}/attendees`),
  registerAttendee: (eventId, payload) => request(`/events/${eventId}/attendees`, { method: 'POST', body: payload }),

  lookupTicket: (code) => request(`/tickets/${code}`),
  checkInTicket: (code) => request(`/tickets/${code}/checkin`, { method: 'POST' }),
};

export { getToken };
