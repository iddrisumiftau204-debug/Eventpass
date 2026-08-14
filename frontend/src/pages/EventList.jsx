import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', venue: '', capacity: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        date: form.date,
        venue: form.venue,
        capacity: form.capacity ? Number(form.capacity) : null,
      };
      if (editingId) {
        await api.updateEvent(editingId, payload);
      } else {
        await api.createEvent(payload);
      }
      setForm({ name: '', date: '', venue: '', capacity: '' });
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(event) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      date: event.date,
      venue: event.venue || '',
      capacity: event.capacity || '',
    });
    setShowForm(true);
  }

  async function handleDelete(eventId) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setSaving(true);
    setError('');
    try {
      await api.deleteEvent(eventId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({ name: '', date: '', venue: '', capacity: '' });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your events</h1>
        <button className="btn-primary" onClick={() => (editingId ? handleCancel() : setShowForm((s) => !s))}>
          {editingId ? 'Cancel edit' : showForm ? 'Cancel' : '+ New event'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <form className="card form-inline" onSubmit={handleCreate}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Date
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            Venue
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </label>
          <label>
            Capacity
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </label>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? (editingId ? 'Updating…' : 'Creating…') : (editingId ? 'Update event' : 'Create event')}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : events.length === 0 ? (
        <p className="muted">No events yet. Create your first one above.</p>
      ) : (
        <ul className="event-list">
          {events.map((ev) => (
            <li key={ev.id} className="card event-row">
              <Link to={`/events/${ev.id}`} className="event-row-main">
                <strong>{ev.name}</strong>
                <span className="muted">
                  {new Date(ev.date).toLocaleString()} {ev.venue ? `· ${ev.venue}` : ''}
                </span>
              </Link>
              <div className="event-row-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleEdit(ev)}
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleDelete(ev.id)}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
