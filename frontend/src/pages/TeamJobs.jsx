import { useState } from 'react';
import { useApp, usePermission } from '../context/AppContext';
import {
  Plus, UserPlus, Search, Filter, MapPin, Clock, Tag,
  DollarSign, Star, ChevronRight, ArrowRight, Briefcase, X
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import './TeamJobs.css';

const COLUMNS = [
  { key: 'open', label: 'Open', color: '#3B82F6' },
  { key: 'assigned', label: 'Assigned', color: '#8B5CF6' },
  { key: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { key: 'completed', label: 'Completed', color: '#10B981' },
];

const TAG_COLORS = {
  wedding: 'blue', outdoor: 'teal', corporate: 'purple', portrait: 'gray',
  fashion: 'rose', editorial: 'purple', event: 'amber', commercial: 'blue',
  drone: 'teal', engagement: 'rose', music: 'purple', maternity: 'green',
  intimate: 'teal', beauty: 'rose', 'real estate': 'amber', urban: 'gray',
};

export default function TeamJobs() {
  const { isStudioOwner } = usePermission();
  return isStudioOwner ? <StudioView /> : <PhotographerView />;
}

/* ── Studio Owner View ───────────────────────────────────────────────────── */
function StudioView() {
  const { state, dispatch, addToast } = useApp();
  const { canPostJob, canInviteMember, canMoveJob } = usePermission();
  const { jobs, team } = state;

  const [showJobModal, setShowJobModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedMember, setExpandedMember] = useState(null);

  // New Job form
  const [newJob, setNewJob] = useState({
    title: '', client: '', date: '', budget: '', location: '', tags: '', notes: '', status: 'open'
  });

  // Invite form
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });

  const handleAddJob = () => {
    if (!newJob.title || !newJob.client) return;
    const job = {
      id: 'J' + Date.now(),
      ...newJob,
      budget: parseFloat(newJob.budget) || 0,
      tags: newJob.tags.split(',').map(t => t.trim()).filter(Boolean),
      assignedTo: null,
    };
    dispatch({ type: 'ADD_JOB', payload: job });
    setShowJobModal(false);
    setNewJob({ title: '', client: '', date: '', budget: '', location: '', tags: '', notes: '', status: 'open' });
    addToast(`Job "${job.title}" added to board!`, 'success');
  };

  const handleInvite = () => {
    if (!newMember.name) return;
    const member = {
      id: Date.now(),
      name: newMember.name,
      role: newMember.role || 'Photographer',
      status: 'available',
      jobsCompleted: 0,
      rating: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: member });
    setShowInviteModal(false);
    setNewMember({ name: '', role: '', email: '' });
    addToast(`${member.name} has been invited!`, 'success');
  };

  const handleMoveJob = (jobId, newStatus) => {
    if (!canMoveJob) return;
    dispatch({ type: 'UPDATE_JOB', payload: { id: jobId, status: newStatus } });
    addToast('Job status updated', 'success');
  };

  return (
    <div className="teamjobs-page">
      {/* Header */}
      <div className="teamjobs-header">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20 }}>Team & Jobs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {team.length} team members · {jobs.filter(j => j.status === 'open').length} open jobs
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {canInviteMember && (
            <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
              <UserPlus size={15} /> Invite Member
            </Button>
          )}
          {canPostJob && (
            <Button variant="primary" onClick={() => setShowJobModal(true)}>
              <Plus size={15} /> New Job
            </Button>
          )}
        </div>
      </div>

      <div className="teamjobs-layout">
        {/* Team Roster */}
        <div className="team-roster">
          <div className="team-roster-header">
            <span className="section-title">Team Roster</span>
            <span className="badge badge-blue">{team.length}</span>
          </div>
          <div className="team-roster-list">
            {team.map(member => (
              <div
                key={member.id}
                className={`team-member-card ${expandedMember === member.id ? 'expanded' : ''}`}
                onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
              >
                <div className="team-member-row">
                  <Avatar name={member.name} size="md" showStatus status={member.status} />
                  <div className="team-member-info">
                    <div className="team-member-name">{member.name}</div>
                    <div className="team-member-role">{member.role}</div>
                  </div>
                  <ChevronRight
                    size={14}
                    style={{
                      color: 'var(--text-muted)',
                      transform: expandedMember === member.id ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </div>
                {expandedMember === member.id && (
                  <div className="team-member-expanded">
                    <div className="team-member-stat">
                      <Briefcase size={12} /> <span>{member.jobsCompleted} jobs completed</span>
                    </div>
                    {member.rating > 0 && (
                      <div className="team-member-stat">
                        <Star size={12} style={{ color: 'var(--accent-amber)' }} />
                        <span>{member.rating} rating</span>
                      </div>
                    )}
                    <div className="team-member-stat">
                      <Clock size={12} /> <span>Joined {member.joinedDate}</span>
                    </div>
                    <div className={`badge badge-${member.status === 'available' ? 'green' : member.status === 'busy' ? 'amber' : 'gray'}`} style={{ marginTop: 4 }}>
                      {member.status}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Job Board Kanban */}
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colJobs = jobs.filter(j => j.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="kanban-col-dot" style={{ background: col.color }} />
                    <span className="kanban-col-title">{col.label}</span>
                  </div>
                  <span className="badge badge-gray">{colJobs.length}</span>
                </div>
                <div className="kanban-cards">
                  {colJobs.map(job => (
                    <KanbanCard
                      key={job.id}
                      job={job}
                      team={team}
                      canMove={canMoveJob}
                      onMove={handleMoveJob}
                      columns={COLUMNS}
                    />
                  ))}
                  {colJobs.length === 0 && (
                    <div className="kanban-empty">
                      <Briefcase size={20} style={{ color: 'var(--text-muted)' }} />
                      <span>No jobs here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Job Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title="Post New Job"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowJobModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddJob}>Post Job</Button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Job Title *</label>
          <input className="input-field" placeholder="e.g. Coastal Elopement" value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div className="input-group">
          <label className="input-label">Client Name *</label>
          <input className="input-field" placeholder="Client or company name" value={newJob.client} onChange={e => setNewJob(p => ({ ...p, client: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label">Date</label>
            <input type="date" className="input-field" value={newJob.date} onChange={e => setNewJob(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Budget ($)</label>
            <input type="number" className="input-field" placeholder="2500" value={newJob.budget} onChange={e => setNewJob(p => ({ ...p, budget: e.target.value }))} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Location</label>
          <input className="input-field" placeholder="City, Country" value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} />
        </div>
        <div className="input-group">
          <label className="input-label">Tags (comma-separated)</label>
          <input className="input-field" placeholder="wedding, outdoor, portrait" value={newJob.tags} onChange={e => setNewJob(p => ({ ...p, tags: e.target.value }))} />
        </div>
        <div className="input-group">
          <label className="input-label">Notes</label>
          <textarea className="input-field" placeholder="Additional details..." value={newJob.notes} onChange={e => setNewJob(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleInvite}>Send Invite</Button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Full Name *</label>
          <input className="input-field" placeholder="e.g. Sofia Reyes" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="input-group">
          <label className="input-label">Role</label>
          <select className="input-field" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
            <option value="">Select role...</option>
            <option>Lead Photographer</option>
            <option>Assistant Photographer</option>
            <option>Videographer</option>
            <option>Editor</option>
            <option>Second Shooter</option>
            <option>Drone Operator</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input type="email" className="input-field" placeholder="member@email.com" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div style={{ padding: 'var(--space-3)', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--accent-blue)' }}>
          💡 An invitation link will be sent to their email address (demo only).
        </div>
      </Modal>
    </div>
  );
}

function KanbanCard({ job, team, canMove, onMove, columns }) {
  const [showMenu, setShowMenu] = useState(false);
  const member = team.find(m => m.id === job.assignedTo);
  const otherColumns = columns.filter(c => c.key !== job.status);

  return (
    <div className="kanban-card">
      <div className="kanban-card-top">
        <div className="kanban-card-title">{job.title}</div>
        {canMove && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowMenu(v => !v)}
              style={{ fontSize: 16, lineHeight: 1 }}
            >⋯</button>
            {showMenu && (
              <div className="kanban-menu">
                {otherColumns.map(col => (
                  <button
                    key={col.key}
                    className="kanban-menu-item"
                    onClick={() => { onMove(job.id, col.key); setShowMenu(false); }}
                  >
                    Move to {col.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="kanban-card-client">{job.client}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
        {job.tags.slice(0, 2).map(tag => (
          <span key={tag} className={`badge badge-${TAG_COLORS[tag] || 'gray'}`} style={{ fontSize: 10 }}>{tag}</span>
        ))}
      </div>
      <div className="kanban-card-footer">
        <div className="kanban-card-meta">
          <MapPin size={10} /> {job.location?.split(',')[0]}
        </div>
        <div className="kanban-card-budget">${job.budget.toLocaleString()}</div>
      </div>
      {member && (
        <div className="kanban-card-assignee">
          <Avatar name={member.name} size="sm" />
          <span>{member.name}</span>
        </div>
      )}
    </div>
  );
}

/* ── Photographer View ─────────────────────────────────────────────────────── */
function PhotographerView() {
  const { state, dispatch, addToast } = useApp();
  const { jobs } = state;
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [activeTab, setActiveTab] = useState('available');

  const allTags = [...new Set(jobs.flatMap(j => j.tags))].sort();
  const openJobs = jobs.filter(j => j.status === 'open').filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.client.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || j.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const myApplications = jobs.filter(j => appliedJobs.has(j.id));

  const handleApply = (job) => {
    setAppliedJobs(prev => new Set([...prev, job.id]));
    dispatch({ type: 'UPDATE_JOB', payload: { id: job.id, status: 'assigned' } });
    addToast(`Applied to "${job.title}" successfully!`, 'success');
  };

  return (
    <div className="teamjobs-page">
      <div className="teamjobs-header">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20 }}>Job Board</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {openJobs.length} opportunities available
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="toggle-group" style={{ marginBottom: 'var(--space-5)' }}>
        <button className={`toggle-option ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>
          Available Jobs
        </button>
        <button className={`toggle-option ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
          My Applications ({appliedJobs.size})
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          {/* Filters */}
          <div className="photographer-filters">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 32 }}
                placeholder="Search jobs or clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field"
              style={{ width: 180 }}
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="photographer-job-grid">
            {openJobs.map(job => (
              <PhotographerJobCard key={job.id} job={job} onApply={handleApply} applied={appliedJobs.has(job.id)} />
            ))}
            {openJobs.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon"><Search size={24} style={{ color: 'var(--accent-blue)' }} /></div>
                <div className="empty-state-title">No jobs found</div>
                <div className="empty-state-desc">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'applied' && (
        <div className="applied-jobs-list">
          {myApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase size={24} style={{ color: 'var(--accent-blue)' }} /></div>
              <div className="empty-state-title">No applications yet</div>
              <div className="empty-state-desc">Apply to jobs from the Available Jobs tab</div>
            </div>
          ) : (
            myApplications.map(job => (
              <div key={job.id} className="applied-job-row card card-padding">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    {job.client} · {job.location} · {job.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>${job.budget.toLocaleString()}</div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PhotographerJobCard({ job, onApply, applied }) {
  return (
    <div className="fl-job-card card card-hover">
      <div className="fl-job-card-inner">
        <div className="fl-job-card-top">
          <div>
            <div className="fl-job-title">{job.title}</div>
            <div className="fl-job-client">{job.client}</div>
          </div>
          <div className="fl-job-budget">${job.budget.toLocaleString()}</div>
        </div>
        <div className="fl-job-meta">
          <span><MapPin size={11} /> {job.location}</span>
          <span><Clock size={11} /> {job.date}</span>
        </div>
        {job.notes && (
          <div className="fl-job-notes">{job.notes}</div>
        )}
        <div className="fl-job-tags">
          {job.tags.map(tag => (
            <span key={tag} className={`badge badge-${TAG_COLORS[tag] || 'gray'}`} style={{ fontSize: 11 }}>
              <Tag size={9} />{tag}
            </span>
          ))}
        </div>
        <button
          className={`btn ${applied ? 'btn-secondary' : 'btn-primary'}`}
          style={{ width: '100%' }}
          onClick={() => !applied && onApply(job)}
          disabled={applied}
        >
          {applied ? '✓ Applied' : 'Apply Now →'}
        </button>
      </div>
    </div>
  );
}
