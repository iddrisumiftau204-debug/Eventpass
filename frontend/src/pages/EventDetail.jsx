import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import TicketQr from '../components/TicketQr';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ev, atts] = await Promise.all([api.getEvent(id), api.listAttendees(id)]);
      setEvent(ev);
      setAttendees(atts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegister(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.registerAttendee(id, form);
      setForm({ name: '', email: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error && !event) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!event) return null;

  return (
    <div className="page">
      <Link to="/" className="back-link">← All events</Link>
      <div className="page-header">
        <div>
          <h1>{event.name}</h1>
          <p className="muted">
            {new Date(event.date).toLocaleString()} {event.venue ? `· ${event.venue}` : ''}
            {event.capacity ? ` · capacity ${event.capacity}` : ''}
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat">
          <span className="stat-value">{event.stats.totalRegistered}</span>
          <span className="stat-label">Registered</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{event.stats.totalCheckedIn}</span>
          <span className="stat-label">Checked in</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{event.stats.checkedInPct}%</span>
          <span className="stat-label">Check-in rate</span>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form className="card form-inline" onSubmit={handleRegister}>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Registering…' : 'Register attendee'}
        </button>
      </form>

      <h2>Attendees</h2>
      {attendees.length === 0 ? (
        <p className="muted">No attendees registered yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Ticket code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>
                  <div className="ticket-cell">
                    <code>{a.ticketCode}</code>
                    <button
                      type="button"
                      className="qr-thumb-btn"
                      title="View / print QR ticket"
                      onClick={() => setTicketModal(a)}
                    >
                      <TicketQr value={a.ticketCode} size={28} />
                    </button>
                  </div>
                </td>
                <td>
                  {a.checkedIn ? (
                    <span className="badge badge-success">Checked in</span>
                  ) : (
                    <span className="badge">Not checked in</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {ticketModal && (
        <div className="modal-overlay" onClick={() => setTicketModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTicketModal(null)} aria-label="Close">
              &times;
            </button>
            <div className="ticket-print">
              <strong>{ticketModal.name}</strong>
              <p className="muted">{event.name}</p>
              <TicketQr value={ticketModal.ticketCode} size={200} />
              <p className="ticket-code-big">{ticketModal.ticketCode}</p>
            </div>
            <button className="btn-primary" onClick={() => window.print()}>
              Print ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
