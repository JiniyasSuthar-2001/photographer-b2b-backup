import React, { useState, useEffect } from 'react';

/*
  Simple form that supports multiple date rows.
  Dates are stored as 'YYYY-MM-DD' strings.
*/
export default function EventForm({ event = null, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState(['']);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDates((event.dates && event.dates.length) ? event.dates : ['']);
    } else {
      setTitle('');
      setDates(['']);
    }
  }, [event]);

  const updateDate = (idx, value) => {
    const next = [...dates];
    next[idx] = value;
    setDates(next);
  };

  const addRow = () => setDates([...dates, '']);
  const removeRow = (idx) => setDates(dates.filter((_, i) => i !== idx));

  const submit = (e) => {
    e.preventDefault();
    const cleaned = dates.map(d => d.trim()).filter(Boolean);
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (cleaned.length === 0) {
      alert('Add at least one date');
      return;
    }
    // store dates as YYYY-MM-DD strings (keep simple for frontend-only app)
    const ev = {
      id: event ? event.id : undefined,
      title: title.trim(),
      dates: cleaned
    };
    onSave(ev);
  };

  return (
    <form onSubmit={submit}>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Dates</label>
        {dates.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input
              type="date"
              value={d}
              onChange={(e) => updateDate(i, e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => removeRow(i)} disabled={dates.length === 1}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addRow}>Add date</button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}