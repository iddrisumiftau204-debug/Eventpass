import { useState, useRef } from 'react';
import { api } from '../api/client';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null); // { kind: 'success'|'already'|'notfound', data }
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.checkInTicket(code.trim().toUpperCase());
      setResult({ kind: 'success', data });
    } catch (err) {
      if (err.status === 409) {
        setResult({ kind: 'already', data: err.body });
      } else if (err.status === 404) {
        setResult({ kind: 'notfound' });
      } else {
        setResult({ kind: 'error', message: err.message });
      }
    } finally {
      setLoading(false);
      setCode('');
      inputRef.current?.focus();
    }
  }

  return (
    <div className="page checkin-page">
      <h1>Check-in</h1>
      <p className="muted">Scan or type a ticket code, then press Enter.</p>

      <form className="card checkin-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          autoFocus
          className="checkin-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="TICKET CODE"
          disabled={loading}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Check in'}
        </button>
      </form>

      {result?.kind === 'success' && (
        <div className="card result result-success">
          <span className="result-icon">✓</span>
          <div>
            <strong>Checked in</strong>
            <p>{result.data.attendee.name} — {result.data.attendee.email}</p>
          </div>
        </div>
      )}

      {result?.kind === 'already' && (
        <div className="card result result-warning">
          <span className="result-icon">!</span>
          <div>
            <strong>Already checked in</strong>
            <p>
              {result.data.attendee.name} was checked in at{' '}
              {new Date(result.data.checkedInAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {result?.kind === 'notfound' && (
        <div className="card result result-error">
          <span className="result-icon">✕</span>
          <div>
            <strong>Ticket not found</strong>
            <p>Double-check the code and try again.</p>
          </div>
        </div>
      )}

      {result?.kind === 'error' && (
        <div className="card result result-error">
          <span className="result-icon">✕</span>
          <div>
            <strong>Something went wrong</strong>
            <p>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
