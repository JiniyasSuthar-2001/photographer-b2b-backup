import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft, ChevronRight, Download, Clock, X, Plus,
  Briefcase, AlertTriangle, Check, Calendar as CalendarIcon
} from 'lucide-react';
import { ROLE_TYPES } from '../data/mockData';
import { jobService, requestService } from '../services/api';
import './Calendar.css';

const AVAIL_COLORS = {
  available: '#10B981', // Emerald Green
  booked: '#2563EB',    // Royal Blue
  blocked: '#F43F5E',   // Rose
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ROLE_KEYS = Object.keys(ROLE_TYPES);

export default function Calendar() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, jobRequests, availability } = state;
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [myJobsReason, setMyJobsReason] = useState('Unavailable');
  const [hoveredDay, setHoveredDay] = useState(null);

  const [showPicker, setShowPicker] = useState(false); // Month/Year picker
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const [newJob, setNewJob] = useState({ title: '', client: '', venue: '', budget: '', roles: [], notes: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isPast = (day) => {
    const d = new Date(year, month, day);
    return d < today;
  };

  const getDayJobs = (day) => {
    const ds = typeof day === 'string' ? day : getDateStr(day);
    const posted = jobs.filter(j => {
      const jobDateStr = typeof j.date === 'string' ? j.date.split('T')[0] : '';
      return jobDateStr === ds;
    });
    const acceptedReqs = jobRequests.filter(r => {
      const reqDateStr = typeof r.date === 'string' ? r.date.split('T')[0] : '';
      return (r.status === 'accepted' || r.status === 'assigned') && reqDateStr === ds;
    });
    return { posted, acceptedReqs };
  };

  const isToday = (day) => {
    const n = new Date();
    return day === n.getDate() && month === n.getMonth() && year === n.getFullYear();
  };

  const selectedDateStr = selectedDate ? getDateStr(selectedDate) : null;
  const { posted: selectedPosted, acceptedReqs: selectedAccepted } = selectedDate ? getDayJobs(selectedDate) : { posted: [], acceptedReqs: [] };

  // --- SYNC DATA WITH BACKEND ---
  useEffect(() => {
    const fetchBackendData = async () => {
      setIsLoading(true);
      try {
        const backendJobs = await jobService.getJobs();
        dispatch({ type: 'SET_JOBS', payload: backendJobs });
      } catch (err) {
        console.error('Failed to sync calendar:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackendData();
  }, []);

  const checkConflicts = (type) => {
    const conflicts = [];
    selectedDates.forEach(ds => {
      const { posted, acceptedReqs } = getDayJobs(ds);
      if (posted.length > 0 || acceptedReqs.length > 0) {
        conflicts.push({ date: ds, jobs: [...posted, ...acceptedReqs] });
      }
    });

    if (conflicts.length > 0) {
      setShowConflictModal({ type, jobs: conflicts });
    } else {
      if (type === 'newJob') setShowNewJobModal(true);
      else proceedUnavailable();
    }
  };

  const proceedUnavailable = () => {
    selectedDates.forEach(date => {
      dispatch({ type: 'SET_AVAILABILITY', payload: { date, status: 'blocked' } });
    });
    addToast(`📅 ${selectedDates.length} days marked as ${myJobsReason}`, 'info');
    setSelectedDates([]);
  };

  const handleAddJob = async () => {
    if (!newJob.title || selectedDates.length === 0) return;
    
    setIsLoading(true);
    try {
      for (const date of selectedDates) {
        await jobService.createJob({
          title: newJob.title,
          category: newJob.roles[0] || 'General',
          date: date
        });
      }
      addToast(`✅ Job(s) posted successfully for ${selectedDates.length} date(s)`, 'success');
      
      // Refresh local list
      const updatedJobs = await jobService.getJobs();
      dispatch({ type: 'SET_JOBS', payload: updatedJobs });
      
      setShowNewJobModal(false);
      setSelectedDates([]);
      setNewJob({ title: '', client: '', venue: '', budget: '', roles: [], notes: '' });
    } catch (err) {
      addToast('Failed to post jobs to backend', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickerSelect = (mIndex) => {
    setCurrentDate(new Date(pickerYear, mIndex, 1));
    setShowPicker(false);
  };

  return (
    <div className="calendar-page">


      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-nav">
            <button className="btn btn-secondary btn-icon" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <h2 className="calendar-month-title clickable" onClick={() => { setShowPicker(true); setPickerYear(year); }}>
              {MONTHS[month]} {year}
              <ChevronRight size={16} className={`picker-arrow ${showPicker ? 'open' : ''}`} />
            </h2>
            <button className="btn btn-secondary btn-icon" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          <div className="calendar-grid-header">
            {DAYS.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e${i}`} className="calendar-cell empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = getDateStr(day);
              const avail = availability[ds] || null;
              const { posted, acceptedReqs } = getDayJobs(day);
              const isSelected = selectedDates.includes(ds);
              const isCellDetail = selectedDate === day;
              const jobCount = posted.length + acceptedReqs.length;
              const past = isPast(day);

              // Determine cell background colour:
              //  - past days: no colour override
              //  - explicit availability set: use that colour
              //  - has a job booked: blue (booked)
              //  - free future day: green (available)
              let cellBg = undefined;
              let cellBorder = undefined;
              if (!past) {
                if (avail) {
                  cellBg = `${AVAIL_COLORS[avail]}99`; // ~60% opacity
                  cellBorder = `${AVAIL_COLORS[avail]}cc`;
                } else if (jobCount > 0) {
                  cellBg = `${AVAIL_COLORS.booked}bb`; // ~75% opacity (Much stronger blue)
                  cellBorder = `${AVAIL_COLORS.booked}ff`;
                } else {
                  // Default available (green)
                  cellBg = `${AVAIL_COLORS.available}44`; // ~25% opacity
                  cellBorder = `${AVAIL_COLORS.available}77`;
                }
              }

              return (
                <div key={day}
                  className={`calendar-cell-wrapper`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div
                    className={`calendar-cell ${isToday(day) ? 'today' : ''} ${isCellDetail ? 'cell-detail' : ''} ${isSelected ? 'selected' : ''} ${past ? 'past' : ''}`}
                    onClick={() => {
                      if (past) return;
                      if (isSelected) {
                        setSelectedDates(prev => prev.filter(d => d !== ds));
                      } else {
                        setSelectedDates(prev => [...prev, ds]);
                        setSelectedDate(day);
                      }
                    }}
                    style={{
                      cursor: past ? 'default' : 'pointer',
                      background: cellBg,
                      borderColor: cellBorder,
                    }}>
                    <span className="calendar-day-num">{day}</span>
                    {isSelected && <div className="selected-indicator"><Check size={10} color="white" /></div>}
                  </div>

                  {/* ── Speech-bubble tooltip ── */}
                  {hoveredDay === day && !past && (jobCount > 0 || avail) && (
                    <div className="cal-tooltip">
                      <div className="cal-tooltip-date">
                        {MONTHS[month].slice(0,3)} {day}
                      </div>
                      {avail && (
                        <div className="cal-tooltip-avail" style={{ color: AVAIL_COLORS[avail] }}>
                          ● {avail.charAt(0).toUpperCase() + avail.slice(1)}
                        </div>
                      )}
                      {posted.map(j => (
                        <div key={j.id} className="cal-tooltip-job">
                          <span className="cal-tooltip-dot" style={{ background: '#6366F1' }} />
                          <span>{j.title}</span>
                        </div>
                      ))}
                      {acceptedReqs.map(r => (
                        <div key={r.id} className="cal-tooltip-job">
                          <span className="cal-tooltip-dot" style={{ background: '#10B981' }} />
                          <span>{r.jobTitle || r.job_title}</span>
                        </div>
                      ))}
                      {jobCount === 0 && !avail && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No bookings</div>
                      )}
                      <div className="cal-tooltip-arrow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <div className="calendar-legend-section">
              <span className="calendar-legend-heading">Availability</span>
              {Object.entries(AVAIL_COLORS).map(([key, color]) => (
                <div key={key} className="calendar-legend-item">
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: `${color}22`,
                    border: `1.5px solid ${color}55`,
                    flexShrink: 0
                  }} />
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bar */}
      {selectedDates.length > 0 && (
        <div className="calendar-floating-bar">
          <div className="floating-bar-info">
            <span className="selection-count">{selectedDates.length}</span>
            <span className="selection-label">Dates Selected</span>
          </div>
          <div className="floating-bar-actions">
            <select className="input-field input-sm" value={myJobsReason} onChange={e => setMyJobsReason(e.target.value)} style={{ width: 140, height: 36 }}>
              <option value="Unavailable">Unavailable</option>
              <option value="Vacation">Vacation</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => checkConflicts('unavailable')}>
              <Briefcase size={14} /> Mark {myJobsReason}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => checkConflicts('newJob')}>
              <Plus size={14} /> Add New Job
            </button>
            <button className="btn-icon-ghost" onClick={() => setSelectedDates([])} style={{ marginLeft: 8 }}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Picker Modal */}
      {showPicker && (
        <div className="modal-overlay" onClick={() => setShowPicker(false)} style={{ zIndex: 4000 }}>
          <div className="modal card-padding" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
            <div className="picker-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button className="btn-icon-ghost" onClick={() => setPickerYear(p => p - 1)}><ChevronLeft size={20} /></button>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{pickerYear}</span>
              <button className="btn-icon-ghost" onClick={() => setPickerYear(p => p + 1)}><ChevronRight size={20} /></button>
            </div>
            <div className="picker-months-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  className={`btn ${pickerYear === year && i === month ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => handlePickerSelect(i)}
                  style={{ padding: '12px 0', justifyContent: 'center' }}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal card-padding" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--accent-rose)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Schedule Conflict Warning</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              You already have jobs scheduled on some of the selected dates. Proceeding will overlap with:
            </p>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {showConflictModal.jobs.map((item, idx) => (
                <div key={idx} style={{ padding: 12, background: 'var(--surface-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{item.date}</div>
                  {item.jobs.map(j => (
                    <div key={j.id} style={{ fontSize: 13, fontWeight: 600 }}>• {j.title || j.jobTitle}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowConflictModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                const type = showConflictModal.type;
                setShowConflictModal(null);
                if (type === 'newJob') setShowNewJobModal(true);
                else proceedUnavailable();
              }}>Confirm & Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="modal-overlay" onClick={() => setShowNewJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Job Details</div>
              <button className="modal-close" onClick={() => setShowNewJobModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-hover)', padding: '12px', borderRadius: 8 }}>
                <strong>Selected Dates ({selectedDates.length}):</strong><br />
                {selectedDates.sort().join(', ')}
              </div>
              {[
                { label: 'Job Title *', key: 'title', placeholder: 'e.g. Santorini Wedding' },
                { label: 'Client', key: 'client', placeholder: 'Client name' },
                { label: 'Venue', key: 'venue', placeholder: 'e.g. Villa Rosita' },
                { label: 'Budget (₹)', key: 'budget', type: 'number', placeholder: '0' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{f.label}</label>
                  <input className="input-field" type={f.type || 'text'} placeholder={f.placeholder || ''} value={newJob[f.key] || ''} onChange={e => setNewJob(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Roles Required</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ROLE_KEYS.map(r => (
                    <button key={r} onClick={() => setNewJob(p => ({ ...p, roles: p.roles.includes(r) ? p.roles.filter(x => x !== r) : [...p.roles, r] }))}
                      className="btn btn-sm"
                      style={{ border: `1.5px solid ${newJob.roles.includes(r) ? ROLE_TYPES[r].color : 'var(--border)'}`, background: newJob.roles.includes(r) ? ROLE_TYPES[r].bg : 'transparent', color: newJob.roles.includes(r) ? ROLE_TYPES[r].color : 'var(--text-secondary)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ROLE_TYPES[r].color, display: 'inline-block', marginRight: 4 }} />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewJobModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddJob} disabled={!newJob.title || isLoading}>
                {isLoading ? 'Posting...' : 'Post Jobs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
