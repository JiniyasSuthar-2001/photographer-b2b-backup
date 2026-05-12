// ==================================================================================
// PAGE: PROJECTS
// Purpose: Centralized management for all project postings, invitations, and work history.
// Connected Pages: 
// - Dashboard.jsx (Triggers navigation to specific tabs via global state)
// - Sidebar.jsx (Notification badge indicators)
// - Team.jsx (Redirects for adding teammates)
// Role Architecture:
// - Photographer: (Studio Owner) Sees 'My Projects', posts new projects, manages requests.
// - Freelancer: (Worker) Sees 'Accepted Projects', 'Invites', and 'Declined Projects'.
// ==================================================================================


import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp, usePermission } from '../context/AppContext';
import { 
  Plus, Search, Filter, Clock, MapPin, Tag, Users, MoreVertical, 
  Send, Trash2, Calendar, Edit2, X, UserPlus, Briefcase, Building, Check, User,
  ChevronDown, IndianRupee, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, requestService, teamService } from '../services/api';
import { sortChronologically } from '../utils/sorting';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/Badge';
import DatePicker from '../components/ui/DatePicker';
import './Projects.css';

const ROLE_STYLES = {
  'Lead':             { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  'Traditional':      { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  'Candid':           { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  'Drone':            { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  'Reel':             { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'Cinematographer':  { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  'Assistant':        { color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  'Helper':           { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
  'Creative Director':{ color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
};

const getRoleStyle = (type) => {
  if (!type) return { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  const key = Object.keys(ROLE_STYLES).find(k => k.toLowerCase() === type.toLowerCase());
  return ROLE_STYLES[key] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
};

const PRESET_ROLES = [
  { name: 'Lead',             color: '#3B82F6' },
  { name: 'Traditional',      color: '#F43F5E' },
  { name: 'Candid',           color: '#10B981' },
  { name: 'Drone',            color: '#8B5CF6' },
  { name: 'Reel',             color: '#F59E0B' },
  { name: 'Cinematographer',  color: '#06B6D4' },
  { name: 'Assistant',        color: '#6366F1' },
  { name: 'Helper',           color: '#94A3B8' },
  { name: 'Creative Director',color: '#EC4899' },
];

export default function Projects({ mode = 'my-jobs' }) {
  const { state, dispatch, addToast } = useApp();
  const { canPostJob } = usePermission();
  const navigate = useNavigate();

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const activeMainTab = mode;
  const [activeSubTab, setActiveSubTab] = useState('accepted');
  const [jobFilter, setJobFilter] = useState('all');
  const [myJobs, setMyJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [declinedInvites, setDeclinedInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(null);
  const [showJobStatusModal, setShowJobStatusModal] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  // --- SEARCH / FILTER STATE ---
  const [projectSearch, setProjectSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [otherSearch, setOtherSearch] = useState('');

  // Derives unique categories from actual job list — auto-updates when new projects are created
  const availableCategories = useMemo(() => {
    const cats = [...new Set(myJobs.map(j => j.category).filter(Boolean))].sort();
    return cats;
  }, [myJobs]);

  useEffect(() => {
    if (editingJob) {
      setSelectedRoles(editingJob.roles || []);
    } else {
      setSelectedRoles([]);
    }
  }, [editingJob, showNewJob]);

  const toggleRole = (roleName) => {
    setSelectedRoles(prev => 
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName) 
        : [...prev, roleName]
    );
  };

  useEffect(() => {
    if (state.activeSubTab) {
      setActiveSubTab(state.activeSubTab);
    }
  }, [state.activeSubTab]);

  useEffect(() => {
    if (activeMainTab === 'my-jobs') {
      setMyJobs(state.jobs);
    } else {
      const allAccepted = state.jobRequests.filter(r => r.status === 'accepted' || r.status === 'assigned');
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (activeSubTab === 'accepted') {
        const filtered = allAccepted.filter(r => {
          const jobDate = new Date(r.job_date);
          jobDate.setHours(0, 0, 0, 0);
          return jobDate.getTime() >= now.getTime();
        });
        setAcceptedJobs(sortChronologically(filtered, 'job_date'));
      } else if (activeSubTab === 'past') {
        const filtered = allAccepted.filter(r => {
          const jobDate = new Date(r.job_date);
          jobDate.setHours(0, 0, 0, 0);
          return jobDate.getTime() < now.getTime();
        });
        setAcceptedJobs(sortChronologically(filtered, 'job_date'));
      } else {
        setAcceptedJobs([]); 
      }

      setInvites(sortChronologically(state.jobRequests.filter(r => r.status === 'pending'), 'job_date'));
      setDeclinedInvites(sortChronologically(state.jobRequests.filter(r => r.status === 'declined'), 'job_date'));

    }
  }, [state.jobs, state.jobRequests, activeMainTab, activeSubTab]);


  // --- DATA FETCHING ---
  const fetchData = async () => {
    /**
     * Logic: Switches endpoints based on the active tab and user role.
     * Connects to: backend/routers/jobs.py & backend/routers/requests.py
     */
    setIsLoading(true);
    try {
      if (activeMainTab === 'my-jobs') {
        const data = await jobService.getJobs();
        setMyJobs(sortChronologically(data, 'date'));
        dispatch({ type: 'SET_JOBS', payload: data });

      } else {
        if (activeSubTab === 'accepted') {
          const data = await requestService.getAcceptedJobs();
          setAcceptedJobs(sortChronologically(data, 'date'));

          // Update global requests too
          const otherRequests = state.jobRequests.filter(r => r.status !== 'accepted' && r.status !== 'assigned');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        } else if (activeSubTab === 'invites') {
          const data = await requestService.getInvites();
          setInvites(sortChronologically(data, 'job_date'));

          const otherRequests = state.jobRequests.filter(r => r.status !== 'pending');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        } else {
          const data = await requestService.getDeclinedInvites();
          setDeclinedInvites(data);
          const otherRequests = state.jobRequests.filter(r => r.status !== 'declined');
          dispatch({ type: 'SET_JOB_REQUESTS', payload: [...data, ...otherRequests] });
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCreateJob = async (jobData) => {
    /**
     * Trigger: 'Create Job' button in modal.
     * Side Effect: Moves job into 'To be allocated' tab automatically (status=open).
     */
    try {
      await jobService.createJob(jobData);
      addToast('Job created successfully', 'success');
      setShowNewJob(false);
      fetchData();
    } catch (err) {
      console.error('Create job error:', err.response?.data || err);
      addToast(err.response?.data?.detail || 'Failed to create job', 'error');
    }
  };

  const handleUpdateJob = async (id, jobData) => {
    try {
      await jobService.updateJob(id, jobData);
      addToast('Job updated successfully', 'success');
      setEditingJob(null);
      fetchData();
    } catch (err) {
      console.error('Update job error:', err.response?.data || err);
      addToast(err.response?.data?.detail || 'Failed to update job', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobService.deleteJob(id);
      addToast('Job deleted successfully', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to delete job', 'error');
    }
  };

  const handleRespondToInvite = async (id, status) => {
    /**
     * Trigger: Accept/Decline buttons.
     * Side Effect: 
     * - If accepted: Job moves to 'Accepted Jobs' tab.
     * - If declined: Job moves to 'Declined Jobs' tab.
     */
    try {
      await requestService.respondToRequest(id, status);
      addToast(`Invite ${status}`, 'success');
      fetchData();
    } catch (err) {
      addToast('Error responding to invite', 'error');
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await requestService.cancelRequest(id);
      addToast('Request cancelled successfully', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to cancel request', 'error');
    }
  };

  // --- UI FILTERING LOGIC ---
  // These functions do NOT fetch data; they filter existing state for the UI.

  const filterMyJobs = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filtered = myJobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      const isPast = job.is_completed || jobDate.getTime() < now.getTime();

      // Status filter
      let statusMatch = true;
      switch (jobFilter) {
        case 'current':      statusMatch = job.accepted_count > 0 && jobDate.getTime() === now.getTime() && !isPast; break;
        case 'yet_to_assign': statusMatch = job.accepted_count === 0 && !isPast; break;
        case 'past':         statusMatch = isPast; break;
        default:             statusMatch = true;
      }

      // Search filter (title / client / location)
      const q = projectSearch.toLowerCase();
      const searchMatch = !q ||
        (job.title || '').toLowerCase().includes(q) ||
        (job.client || '').toLowerCase().includes(q) ||
        (job.location || '').toLowerCase().includes(q);

      // Category filter
      const catMatch = categoryFilter === 'All' || job.category === categoryFilter;

      return statusMatch && searchMatch && catMatch;
    });

    return sortChronologically(filtered);
  };

  const getLatestRequest = (jobId) => {
    const jobReqs = state.jobRequests.filter(r => (r.jobId === jobId || r.job_id === jobId));
    if (jobReqs.length === 0) return null;
    
    // Sort by sentAt descending (handle both sentAt and sent_at)
    return [...jobReqs].sort((a, b) => {
      const dateA = new Date(a.sentAt || a.sent_at || 0);
      const dateB = new Date(b.sentAt || b.sent_at || 0);
      return dateB - dateA;
    })[0];
  };



  const [expandedJobId, setExpandedJobId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const getGroupedRequests = (jobId) => {
    const jobReqs = state.jobRequests.filter(r => (r.jobId === jobId || r.job_id === jobId));
    return {
      accepted: jobReqs.filter(r => r.status === 'accepted' || r.status === 'assigned'),
      declined: jobReqs.filter(r => r.status === 'declined'),
      pending: jobReqs.filter(r => r.status === 'pending')
    };
  };

  const getRoleClass = (role) => {
    const roleLower = role.toLowerCase();
    if (['drone', 'lead', 'candid', 'traditional', 'reel'].includes(roleLower)) {
      return `role-new-${roleLower}`;
    }
    return 'role-new-default';
  };

  return (
    <>
      <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1 className="page-title">{activeMainTab === 'my-jobs' ? 'My Projects' : 'Other Projects'}</h1>
          <p className="page-subtitle">
            {activeMainTab === 'my-jobs' 
              ? 'Manage your projects and invitations' 
              : 'Track projects you have been invited to or accepted'}
          </p>
        </div>
        {canPostJob && (
          <button className="btn-post-project" onClick={() => setShowNewJob(true)}>
            <Plus size={18} /> Post New Project
          </button>
        )}
      </div>

      {/* ─── SHARED SEARCH / FILTER BAR ─── */}
      <div className="projects-filter-bar">
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={activeMainTab === 'my-jobs' ? 'Search by title, client or location…' : 'Search projects…'}
            value={activeMainTab === 'my-jobs' ? projectSearch : otherSearch}
            onChange={e => activeMainTab === 'my-jobs' ? setProjectSearch(e.target.value) : setOtherSearch(e.target.value)}
          />
        </div>
        {activeMainTab === 'my-jobs' && (
          <select
            className="role-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {availableCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {activeMainTab === 'my-jobs' ? (
        <div className="my-jobs-section">
          <div className="sub-tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'current', label: 'Current' },
              { id: 'yet_to_assign', label: 'To be allocated' },
              { id: 'past', label: 'Past' }
            ].map(t => (
              <button 
                key={t.id} 
                className={`sub-tab ${jobFilter === t.id ? 'active' : ''}`}
                onClick={() => setJobFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="project-list-container">
            {isLoading ? (
              <div className="loading-state">Loading jobs...</div>
            ) : filterMyJobs().length === 0 ? (
              <div className="empty-state">No jobs found</div>
            ) : (
              filterMyJobs().map(job => {
                const isExpanded = expandedJobId === job.id;
                const requests = getGroupedRequests(job.id);
                
                return (
                  <div key={job.id} className={`project-row ${isExpanded ? 'expanded' : ''} ${job.is_completed ? 'completed-lifecycle' : ''}`}>
                    <div className="row-summary" onClick={() => toggleExpand(job.id)}>
                      <div className="summary-left">
                        <div className={`status-indicator ${job.status === 'open' ? 'active' : ''}`}></div>
                        <div>
                          <h4 className="project-title">{job.title || 'Untitled Job'}</h4>
                          <p className="project-subtitle">Client: {job.client || 'Direct Booking'}</p>
                        </div>
                      </div>
                      
                      <div className="summary-details">
                        <span className="meta-item"><Calendar size={14} /> {job.date ? new Date(job.date).toLocaleDateString('en-GB') : 'No date'}</span>
                        <span className="meta-item"><MapPin size={14} /> {job.location || job.venue || 'No location'}</span>
                      </div>

                      <div className="summary-actions">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <div className="row-details">
                      {job.roles?.length > 0 && (
                        <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                          <h5 className="section-title">Required Roles</h5>
                          <div className="role-stack" style={{ flexWrap: 'wrap', gap: '8px' }}>
                            {job.roles.map((role, idx) => (
                              <span key={idx} className={`role-pill-new ${getRoleClass(role)}`} style={{ padding: '6px 12px', fontSize: '11px' }}>{role}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="details-grid">
                        <div className="status-section">
                          <h5 className="section-title">Team Management</h5>
                          
                            <div className="status-group">
                              <label className="group-label label-accepted">Accepted ({requests.accepted.length})</label>
                              {requests.accepted.length === 0 ? <p className="reason" style={{marginLeft: 0}}>No photographers assigned yet.</p> : 
                                requests.accepted.map(req => (
                                  <div key={req.id} className="freelancer-item">
                                    <div className="f-info">
                                      <span className="f-name">{req.receiver_name || req.sentTo}</span>
                                      <span className="f-role">{req.role}</span>
                                    </div>
                                    <button className="btn-text">View Contract</button>
                                  </div>
                                ))
                              }
                            </div>
  
                            <div className="status-group">
                              <label className="group-label label-rejected">Declined ({requests.declined.length})</label>
                              {requests.declined.length === 0 ? <p className="reason" style={{marginLeft: 0}}>No declined invites.</p> :
                                requests.declined.map(req => (
                                  <div key={req.id} className="freelancer-item">
                                    <div className="f-info">
                                      <span className="f-name">{req.receiver_name || req.sentTo}</span>
                                      <span className="reason">Reason: {req.decline_reason || 'Schedule Conflict'}</span>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
  
                            <div className="status-group">
                              <label className="group-label label-pending">Pending ({requests.pending.length})</label>
                              {requests.pending.length === 0 ? <p className="reason" style={{marginLeft: 0}}>No pending invites.</p> : 
                                requests.pending.map(req => (
                                  <div key={req.id} className="freelancer-item">
                                    <span className="f-name">{req.receiver_name || req.sentTo}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      <button className="btn-resend" onClick={(e) => { e.stopPropagation(); addToast('Invite resent!'); }}>Resend</button>
                                      <button 
                                        className="btn-action-new btn-action-danger" 
                                        style={{ padding: '6px', minWidth: 'unset', flex: 'unset', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Cancel Request"
                                        onClick={(e) => { e.stopPropagation(); handleCancelRequest(req.id); }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>

                        <div className="logistics-section">
                          <h5 className="section-title">Financials & Logistics</h5>
                          <div className="budget-box">
                            <span className="budget-label">Total Budget</span>
                            <span className="amount">₹{job.budget?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="action-row">
                            <button className="btn-action-new" onClick={(e) => { e.stopPropagation(); setEditingJob(job); }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button className="btn-action-new" onClick={(e) => { e.stopPropagation(); setShowRequestModal(job); }}>
                              <Send size={14} /> Invite
                            </button>
                            <button className="btn-action-new btn-action-danger" onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* VIEW: ACCEPTED JOBS / INVITES (PHOTOGRAPHER) - Keeping standard card style for now or update to match? */
        /* User asked to use new style instead of card system, so let's apply it here too if appropriate, 
           but the provided style is very Studio-Owner focused. I'll stick to updating the main "My Jobs" first. */
        <div className="accepted-jobs-section">
          <div className="sub-tabs">
            <button 
              className={`sub-tab ${activeSubTab === 'accepted' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('accepted')}
            >
              Accepted Projects
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'invites' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('invites')}
            >
              Invites {invites.length > 0 && <span className="badge">{invites.length}</span>}
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('past')}
            >
              Past Assignments
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'declined' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('declined')}
            >
              Declined Projects
            </button>
          </div>

          <div className="project-list-container">
            {(activeSubTab === 'accepted' || activeSubTab === 'past') ? (
              acceptedJobs.filter(j => {
                const q = otherSearch.toLowerCase();
                const searchMatch = !q || (j.title || j.job_title || '').toLowerCase().includes(q) || (j.owner_name || j.sender_name || '').toLowerCase().includes(q);
                if (!searchMatch) return false;
                const jobDate = new Date(j.date || j.job_date);
                const isPast = jobDate.getTime() < new Date().setHours(0,0,0,0);
                return activeSubTab === 'past' ? isPast : !isPast;
              }).length === 0 ? (
                <div className="empty-state">No {activeSubTab === 'past' ? 'past' : 'upcoming accepted'} jobs available yet.</div>
              ) : (
                acceptedJobs.filter(j => {
                  const jobDate = new Date(j.date || j.job_date);
                  const isPast = jobDate.getTime() < new Date().setHours(0,0,0,0);
                  return activeSubTab === 'past' ? isPast : !isPast;
                }).map(job => (
                  <div key={job.id} className="project-row" style={{cursor: 'default'}}>
                    <div className="row-summary">
                      <div className="summary-left">
                        <div className="status-indicator active"></div>
                        <div>
                          <h4 className="project-title">{job.title || job.job_title}</h4>
                          <p className="project-subtitle">From: {job.owner_name || job.sender_name}</p>
                        </div>
                      </div>
                      <div className="summary-details">
                        <span className="meta-item"><Clock size={14} /> {new Date(job.date || job.job_date).toLocaleDateString('en-GB')}</span>
                        <div className="role-stack">
                           <span className={`role-pill-new ${getRoleClass(job.role)}`}>{job.role}</span>
                        </div>
                      </div>
                      <div className="summary-actions">
                        <button className="btn-text" onClick={() => setShowCollaborationModal(job)}>Details</button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : activeSubTab === 'invites' ? (
              invites.length === 0 ? (
                <div className="empty-state">No pending invites</div>
              ) : (
                invites.map(invite => (
                  <div key={invite.id} className="project-row">
                    <div className="row-summary" style={{cursor: 'default'}}>
                      <div className="summary-left">
                        <div className="status-indicator" style={{background: '#3B82F6'}}></div>
                        <div>
                          <h4 className="project-title">{invite.job_title}</h4>
                          <p className="project-subtitle">Studio: {invite.sender_name}</p>
                        </div>
                      </div>
                      <div className="summary-details">
                        <span className="meta-item"><IndianRupee size={14} /> {invite.budget}</span>
                        <div className="role-stack">
                           <span className={`role-pill-new ${getRoleClass(invite.role)}`}>{invite.role}</span>
                        </div>
                      </div>
                      <div className="invite-actions">
                        <button className="btn-action-new" style={{padding: '6px 12px'}} onClick={() => handleRespondToInvite(invite.id, 'accepted')}>Accept</button>
                        <button className="btn-action-new btn-action-danger" style={{padding: '6px 12px'}} onClick={() => handleRespondToInvite(invite.id, 'declined')}>Decline</button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              declinedInvites.length === 0 ? (
                <div className="empty-state">No declined jobs</div>
              ) : (
                declinedInvites.map(invite => (
                  <div key={invite.id} className="project-row" style={{opacity: 0.6}}>
                     <div className="row-summary" style={{cursor: 'default'}}>
                      <div className="summary-left">
                        <div className="status-indicator" style={{background: '#F43F5E'}}></div>
                        <div>
                          <h4 className="project-title">{invite.job_title}</h4>
                          <p className="project-subtitle">Studio: {invite.sender_name}</p>
                        </div>
                      </div>
                      <div className="summary-details">
                         <span className="meta-item"><Calendar size={14} /> {new Date(invite.job_date).toLocaleDateString('en-GB')}</span>
                         <div className="role-stack">
                           <span className={`role-pill-new role-new-default`}>{invite.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {showRequestModal && createPortal(
        <SendRequestModal 
          initialJob={showRequestModal} 
          allJobs={myJobs.filter(j => j.status !== 'completed')}
          team={state.team || []}
          onClose={() => setShowRequestModal(null)}
          onSend={async (data) => {
            try {
              await requestService.sendRequest(data);
              addToast('Request sent successfully!', 'success');
              setShowRequestModal(null);
              fetchData();
            } catch (err) {
              addToast('Failed to send request', 'error');
            }
          }}
          onAddTeammate={() => navigate('/team', { state: { openAddModal: true } })}
        />,
        document.body
      )}

      {showCollaborationModal && createPortal(
        <CollaborationModal 
          job={showCollaborationModal} 
          onClose={() => setShowCollaborationModal(null)} 
        />,
        document.body
      )}

      {(showNewJob || editingJob) && createPortal(
        <div className="modal-overlay ecosystem-overlay" onClick={() => { setShowNewJob(false); setEditingJob(null); }}>
          <div className="modal redesigned-job-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-left">
                <h2>Project Details</h2>
                <span className="header-date-badge">
                  {editingJob?.date ? new Date(editingJob.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
              <button className="close-btn" onClick={() => { setShowNewJob(false); setEditingJob(null); }}><X size={20} /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const data = {
                title: fd.get('title'),
                client: fd.get('client'),
                venue: fd.get('venue'),
                budget: parseInt(fd.get('budget')) || 0,
                category: fd.get('category'),
                date: fd.get('date'),
                roles: selectedRoles
              };
              if (editingJob) {
                handleUpdateJob(editingJob.id, data);
              } else {
                handleCreateJob(data);
              }
            }} className="landscape-form">
              <div className="landscape-grid-full">
                <div className="redesigned-row">
                  <div className="mockup-field">
                    <label>Project Title *</label>
                    <input name="title" className="mockup-input" placeholder="e.g. Santorini Wedding" defaultValue={editingJob?.title} required />
                  </div>
                  <div className="mockup-field">
                    <label>Client</label>
                    <input name="client" className="mockup-input" placeholder="Client name" defaultValue={editingJob?.client} />
                  </div>
                </div>
                <div className="redesigned-row">
                  <div className="mockup-field">
                    <label>Venue</label>
                    <input name="venue" className="mockup-input" placeholder="e.g. Villa Rosita" defaultValue={editingJob?.venue} />
                  </div>
                  <div className="mockup-field">
                    <label>Budget (₹)</label>
                    <input name="budget" type="number" className="mockup-input" placeholder="0" defaultValue={editingJob?.budget || 0} />
                  </div>
                </div>
                <div className="mockup-roles-section" style={{alignItems:'flex-start', marginTop: '8px'}}>
                  <label className="mockup-section-label">Roles Required</label>
                  <div className="landscape-roles-grid">
                    {PRESET_ROLES.map(role => (
                      <div key={role.name} className={`mockup-role-label ${selectedRoles.includes(role.name) ? 'selected' : ''}`} onClick={() => toggleRole(role.name)}>
                        <div className="mockup-role-custom">
                          <div className="dot" style={{backgroundColor: role.color}} />
                          {role.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:'none'}}>
                   <input name="category" defaultValue={editingJob?.category || 'Wedding'} />
                   <input name="date" type="date" defaultValue={formatDateForInput(editingJob?.date)} />
                </div>
                <div className="landscape-footer">
                  <button type="button" className="btn-cancel-ghost" onClick={() => { setShowNewJob(false); setEditingJob(null); }}>Cancel</button>
                  <button type="submit" className="btn-create-ecosystem">{editingJob ? 'Update Project' : 'Post Project'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      </div>
    </>
  );
}

/**
 * COMPONENT: CollaborationModal
 * Connects to: backend/routers/team.py -> /collaborations/{id}
 * Purpose: Displays 'Trust' metrics through shared work history.
 */
/**
 * COMPONENT: SendRequestModal
 * Logic: Matches selected job category with team member specialties.
 */
function SendRequestModal({ initialJob, allJobs, team, onClose, onSend, onAddTeammate }) {
  const [selectedJob, setSelectedJob] = useState(initialJob);
  // Default to first role or job category if no roles
  const [selectedRole, setSelectedRole] = useState(initialJob.roles?.[0] || initialJob.category);
  const [selectedMember, setSelectedMember] = useState(null);
  const [budget, setBudget] = useState(selectedJob.budget || 0);
  const [searchQuery, setSearchQuery] = useState('');

  // No longer filtering by category matching. All teammates are available.
  const filteredTeam = team.filter(m => 
    (m.name || m.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay ecosystem-overlay" onClick={onClose}>
      <div className="modal request-modal redesigned-request-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon-title">
            <Send size={20} className="header-icon" />
            <h3>Send Job Request</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', flex: 1, overflow: 'hidden' }}>
          
          {/* Left: Configuration */}
          <div className="modal-body-config" style={{ padding: '40px', borderRight: '1px solid var(--border)', background: '#FAFAFA', overflowY: 'auto' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--text-main)', marginTop: 0 }}>Request Details</h4>
            
            <div className="request-form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Assigned Role</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'white', fontSize: '14px', cursor: 'pointer' }}
              >
                {[...new Set(selectedJob.roles?.length > 0 ? selectedJob.roles : [selectedJob.category])].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="request-form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Offer Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'white', fontSize: '15px', fontWeight: 600 }}
                />
              </div>
            </div>
            
            <div className="info-box" style={{ padding: '20px', background: 'rgba(59,130,246,0.06)', borderRadius: '14px', border: '1px solid rgba(59,130,246,0.15)', marginTop: '40px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} fill="#3B82F6" stroke="#3B82F6" /> Pro Tip
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Offering a competitive rate increases your chances of getting accepted by top professionals quickly. Ensure the rate matches the project's requirements.
              </p>
            </div>
          </div>

          {/* Right: Teammate Selection */}
          <div className="teammate-selection-panel" style={{ padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Select Professional</label>
              <div className="search-mini" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', width: '220px' }}>
                <Search size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input 
                  placeholder="Search network..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>

            <div className="teammate-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {filteredTeam.length === 0 ? (
                <div className="empty-mini-state" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p>No professionals found.</p>
                  <button className="btn-link" onClick={onAddTeammate} style={{ marginTop: '8px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Invite to Network</button>
                </div>
              ) : (
                filteredTeam.map(member => (
                  <div 
                    key={member.id} 
                    className={`teammate-item-request ${selectedMember?.id === member.id ? 'active' : ''}`}
                    onClick={() => setSelectedMember(member)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '14px', 
                      border: `1px solid ${selectedMember?.id === member.id ? '#3B82F6' : 'var(--border)'}`, 
                      background: selectedMember?.id === member.id ? 'rgba(59,130,246,0.04)' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                      boxShadow: selectedMember?.id === member.id ? '0 4px 12px rgba(59,130,246,0.1)' : 'none'
                    }}
                  >
                    <Avatar name={member.name || member.display_name} size="md" />
                    <div className="member-meta" style={{ marginLeft: '16px', flex: 1 }}>
                      <p className="name" style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>{member.name || member.display_name}</p>
                      <p className="info" style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                        {member.category || member.display_category} <span style={{ opacity: 0.5 }}>•</span> {member.city || member.display_city || 'Remote'}
                      </p>
                    </div>
                    {selectedMember?.id === member.id && (
                      <div style={{ background: '#3B82F6', borderRadius: '50%', padding: '4px', display: 'flex', color: 'white' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '20px 40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'white' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
          <button 
            disabled={!selectedMember}
            onClick={() => onSend({
              job_id: selectedJob.id,
              receiver_id: (selectedMember.member_id || selectedMember.id),
              role: selectedRole,
              budget: parseInt(budget)
            })}
            style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: selectedMember ? 'var(--primary-gradient)' : '#E2E8F0', color: selectedMember ? 'white' : '#94A3B8', cursor: selectedMember ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: selectedMember ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none', transition: 'all 0.2s' }}
          >
            <Send size={16} /> Send Invitation
          </button>
        </div>
    </div>
  </div>
);
}


function CollaborationModal({ job, onClose }) {
  const [history, setHistory] = useState({ data: [], page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await teamService.getCollaborations(job.owner_id, history.page);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [job.owner_id, history.page]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal collaboration-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Collaboration History with {job.owner_name}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div>Loading...</div>
          ) : history.data.length === 0 ? (
            <div className="empty-state">No shared work history yet.</div>
          ) : (
            <>
              <div className="collab-list">
                {history.data.map(item => (
                  <div key={item.job_id} className="collab-item">
                    <div className="collab-info">
                      <p className="collab-title">{item.title}</p>
                      <p className="collab-date">{new Date(item.date).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className="collab-role">{item.role}</span>
                  </div>
                ))}
              </div>
              {/* Pagination Impact: Changing history.page triggers a new API call */}
              <div className="modal-pagination">
                <button 
                  disabled={history.page === 1} 
                  onClick={() => setHistory(h => ({ ...h, page: h.page - 1 }))}
                >
                  &lt;
                </button>
                <span>Page {history.page} of {history.total_pages}</span>
                <button 
                  disabled={history.page === history.total_pages} 
                  onClick={() => setHistory(h => ({ ...h, page: h.page + 1 }))}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// --- SUB-COMPONENT: JOB STATUS MODAL ---
function JobStatusModal({ job, onClose, fetchData }) {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('accepted');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getRequestsByJob(job.id);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching job requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [job.id]);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await requestService.cancelRequest(requestId);
      // Local refresh
      fetchRequests();
      // Global refresh for JobHub counts
      fetchData(); 
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal status-tracking-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Users size={20} color="var(--accent-purple)" />
            <h2>Request Status: {job.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="status-tabs">
          {[
            { id: 'accepted', label: 'Accepted', color: '#10B981' },
            { id: 'pending', label: 'Pending', color: '#F59E0B' },
            { id: 'declined', label: 'Declined', color: '#F43F5E' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ '--tab-color': tab.color }}
            >
              {tab.label}
              <span className="tab-count">{requests.filter(r => r.status === tab.id).length}</span>
            </button>
          ))}
        </div>

        <div className="modal-content">
          {isLoading ? (
            <div className="loading-state">Loading status...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">No {activeTab} requests for this job.</div>
          ) : (
            <div className="status-list">
              {filteredRequests.map(req => (
                <div key={req.id} className="status-item">
                  <div className="status-item-left">
                    <Avatar name={req.receiver_name} size="sm" />
                    <div>
                      <div className="photographer-name">{req.receiver_name}</div>
                      <div className="photographer-role">Role: {req.role}</div>
                    </div>
                  </div>
                  <div className="status-item-right" style={{display:'flex', alignItems:'center', gap:10}}>
                    {activeTab === 'pending' && (
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleCancelRequest(req.id)}
                        style={{color:'var(--accent-rose)', fontSize:12}}
                      >
                        Cancel
                      </button>
                    )}
                    <div className={`status-pill-small ${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
