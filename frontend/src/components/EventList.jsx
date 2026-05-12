import React from 'react';

function formatDate(d) {
  try {
    // d is 'YYYY-MM-DD'
    const [y, m, day] = d.split('-');
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function EventList({ events = [], onEdit, onDelete }) {
  if (events.length === 0) return <p>No events yet.</p>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {events.map(e => (
        <div key={e.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{e.title}</div>
            <div style={{ color: '#555', marginTop: 6 }}>
              {e.dates && e.dates.length
                ? e.dates.map((d, i) => <span key={i} style={{ display: 'inline-block', marginRight: 8 }}>{formatDate(d)}</span>)
                : <small>No dates</small>
              }
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(e)}>Edit</button>
            <button onClick={() => onDelete(e.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}