// ==================================================================================
// TEAM MANAGEMENT PAGE
// Purpose: Allows Studio Owners to build and manage their personal directory 
// of photographers and track shared work history.
// Connects to: backend/routers/team.py
// ==================================================================================

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, ChevronLeft, ChevronRight, UserPlus, Clock, Send, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { createPortal } from 'react-dom';
import JobSelectionModal from '../components/team/JobSelectionModal';
import { teamService } from '../services/api';
import apiClient from '../services/api';
import { sortChronologically } from '../utils/sorting';
import './Team.css';

export default function Team() {
  const { state, dispatch, addToast } = useApp();
  const location = useLocation();
  const { team } = state;
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  // --- STATE: COLLABORATION HISTORY ---
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- STATE: MEMBER MANAGEMENT ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: 'Candid', city: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', city: '' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToInvite, setMemberToInvite] = useState(null);

  // --- STATE: EXTERNAL TEAMS & REQUESTS ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // --- STATE: FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // --- API: FETCH COLLABORATION HISTORY ---
  const fetchHistory = async (memberId, currentPage) => {
    setIsLoadingHistory(true);
    try {
      const response = await apiClient.get(`/team/collaborations/${memberId}`, {
        params: { page: currentPage, limit: 10 }
      });
      setHistory(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching history:', error);
      addToast('Failed to fetch collaboration history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedPhotographer) {
      fetchHistory(selectedPhotographer.id, page);
    }
  }, [selectedPhotographer, page]);

  // --- API: FETCH TEAM DIRECTORY ---
  const fetchTeam = async () => {
    setIsLoadingTeam(true);
    try {
      const data = await teamService.getTeam();
      dispatch({ type: 'SET_TEAM', payload: data });
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const fetchExternalData = async () => {
    setIsLoadingExternal(true);
    try {
      const [requests, joined] = await Promise.all([
        teamService.getPendingRequests(),
        teamService.getJoinedTeams()
      ]);
      setPendingRequests(requests);
      setJoinedTeams(joined);
    } catch (error) {
      console.error('Error fetching external team data:', error);
    } finally {
      setIsLoadingExternal(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchExternalData();
  }, []);

  // --- REDIRECT LOGIC: CHECK FOR EXTERNAL TRIGGERS ---
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- API: ADD TEAMMATE (SEND REQUEST) ---
  const handleEmailCheck = async (email) => {
    const cleanEmail = email.trim();
    if (!cleanEmail.includes('@')) return;
    setIsCheckingEmail(true);
    try {
      const response = await apiClient.get(`/team/users/search?email=${cleanEmail}`);
      setFoundUser(response.data);
      setAddForm({
        name: response.data.full_name || response.data.username,
        role: response.data.category || 'Candid',
        city: response.data.city || '',
        email: response.data.email
      });
    } catch (err) {
      console.error('Search error:', err.response?.data || err.message);
      setFoundUser(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.email) return;
    setIsSubmitting(true);
    try {
      const payload = {
        email: addForm.email,
        display_name: addForm.name || `User ${addForm.email.split('@')[0]}`,
        display_category: addForm.role || 'Other',
        display_city: addForm.city || 'Unknown'
      };
      await teamService.sendTeamRequest(payload);
      addToast('Team request sent successfully');
      setShowAddModal(false);
      setAddForm({ name: '', role: 'Candid', city: '', email: '' });
      setFoundUser(null);
      fetchTeam();
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to send request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondToTeamRequest = async (requestId, status) => {
    try {
      await teamService.respondToTeamRequest(requestId, status);
      addToast(`Invitation ${status}`);
      fetchExternalData();
      if (status === 'accepted') fetchTeam();
    } catch (error) {
      addToast('Failed to respond to invitation', 'error');
    }
  };

  // --- API: UPDATE TEAMMATE (EDIT ALIAS) ---
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/team/${memberToEdit.id}`, 
        { 
          display_name: editForm.name,
          display_category: editForm.role,
          display_city: editForm.city
        }
      );
      addToast('Member info updated');
      setShowEditModal(false);
      fetchTeam();
    } catch (error) {
      addToast('Update failed', 'error');
    }
  };

  // --- API: REMOVE TEAMMATE ---
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await apiClient.delete(`/team/${memberId}`);
      addToast('Member removed');
      fetchTeam();
    } catch (error) {
      addToast('Delete failed', 'error');
    }
  };

  const handleNameClick = (member) => {
    setSelectedPhotographer(member);
    setPage(1);
  };

  const openEditModal = (member) => {
    setMemberToEdit(member);
    setEditForm({ name: member.name, role: member.category, city: member.city });
    setShowEditModal(true);
  };

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1 className="page-title" style={{margin:0}}>Team Ecosystem</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>
            Unified directory of your connections, collaborations, and team memberships.
          </div>
        </div>
        <div style={{display:'flex', gap: 12}}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} style={{marginRight: 8}} /> Add Freelancer
          </button>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="pending-invites-integrated">
          <div className="alert-banner">
            <UserPlus size={18} />
            <span>You have {pendingRequests.length} pending team invitation{pendingRequests.length > 1 ? 's' : ''}</span>
          </div>
          <div className="invites-grid-unified">
            {pendingRequests.map(req => (
              <div key={req.id} className="invite-card-mini">
                <div className="invite-info">
                  <Avatar name={req.sender_name} size="xs" />
                  <span className="invite-text"><b>{req.sender_name}</b> invited you as {req.display_category}</span>
                </div>
                <div className="invite-actions">
                  <button className="btn-icon-check" onClick={() => handleRespondToTeamRequest(req.id, 'accepted')} title="Accept"><Check size={14} /></button>
                  <button className="btn-icon-cancel" onClick={() => handleRespondToTeamRequest(req.id, 'declined')} title="Decline"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="discovery-filters" style={{ marginBottom: 16 }}>
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by name or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="role-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Lead">Lead</option>
          <option value="Traditional">Traditional</option>
          <option value="Candid">Candid</option>
          <option value="Drone">Drone</option>
          <option value="Reel">Reel</option>
          <option value="Cinematographer">Cinematographer</option>
          <option value="Assistant">Assistant</option>
          <option value="Helper">Helper</option>
          <option value="Creative Director">Creative Director</option>
        </select>
      </div>

      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Jobs Together</th>
              <th>Roles</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 && joinedTeams.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding: 40, color: 'var(--text-muted)'}}>No team members yet. Add someone by phone!</td></tr>
            ) : (
              <>
                {team.filter(m => 
                  (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.city.toLowerCase().includes(searchTerm.toLowerCase())) &&
                  (roleFilter === 'All' || m.category === roleFilter)
                ).map(m => (
                  <tr key={m.id} className={m.is_locked ? 'member-locked-row' : ''}>
                    <td>
                      <div className="team-member-name-cell" onClick={() => !m.is_locked && handleNameClick(m)} style={{cursor: m.is_locked ? 'default' : 'pointer'}}>
                        <Avatar name={m.name} size="sm" />
                        <span className="member-name-link">{m.name}</span>
                      </div>
                    </td>
                    <td>{m.jobsCompleted}</td>
                    <td>
                      <div className="team-role-cell">
                        <span className="role-pill">{m.category}</span>
                      </div>
                    </td>
                    <td>{m.city}</td>
                    <td>{m.phone}</td>
                    <td>{m.email}</td>
                    <td>
                      <div className="team-action-cell">
                        {!m.is_locked && (
                          <>
                            <button className="btn btn-ghost btn-sm" title="Invite to Project" onClick={() => {
                              setMemberToInvite(m);
                              setIsInviteModalOpen(true);
                            }}>
                              <Send size={16} />
                            </button>
                            <button className="btn btn-ghost btn-sm" title="Edit Info" onClick={() => openEditModal(m)}>
                              <Edit2 size={16} />
                            </button>
                          </>
                        )}
                        <button className="btn btn-ghost btn-sm" title="View History" onClick={() => handleNameClick(m)}>
                          <Clock size={16} />
                        </button>
                        <button className="btn btn-danger btn-sm" title="Remove Member" onClick={() => handleDeleteMember(m.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {joinedTeams.filter(jt => 
                  (jt.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) || jt.display_city.toLowerCase().includes(searchTerm.toLowerCase())) &&
                  (roleFilter === 'All' || jt.display_category === roleFilter)
                ).map(jt => (
                  <tr key={`joined-${jt.id}`} className="joined-team-row">
                    <td>
                      <div className="team-member-name-cell">
                        <Avatar name={jt.owner_name} size="sm" />
                        <span className="member-name-link">{jt.owner_name}'s Studio</span>
                      </div>
                    </td>
                    <td>—</td>
                    <td>
                      <div className="team-role-cell">
                        <span className="role-pill secondary">{jt.display_category}</span>
                      </div>
                    </td>
                    <td>{jt.display_city}</td>
                    <td>{jt.owner_phone}</td>
                    <td>{jt.owner_email}</td>
                    <td>
                      <div className="team-action-cell">
                        <span style={{fontSize:11, color:'var(--text-muted)'}}>Manage in Profile</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={!!selectedPhotographer} 
        onClose={() => setSelectedPhotographer(null)}
        title={`Collaboration History - ${selectedPhotographer?.name}`}
        size="lg"
      >
        <div className="history-modal-content">
          {isLoadingHistory ? (
            <div className="loading-state">Loading history...</div>
          ) : history.length > 0 ? (
            <>
              <div className="history-list">
                {/* CHRONOLOGICAL SORTING: Ensuring immediate work/recent history is prioritized */}
                {sortChronologically(history).map(job => (
                  <div key={job.job_id} className={`history-item ${new Date(job.date) < new Date() ? 'is-past' : ''}`}>

                    <div className="history-info">
                      <div className="history-date">{new Date(job.date).toLocaleDateString('en-GB')}</div>
                      <div className="history-title">{job.title}</div>
                    </div>
                    <div className="history-meta">
                      <span className="history-role">{job.role}</span>
                      {job.status && <span className={`status-pill ${job.status}`}>{job.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination depends on 'totalPages' returned by backend */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button 
                    className="pagination-btn" 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">No shared jobs found yet.</div>
          )}
        </div>
      </Modal>

      {/* MODAL: Add Teammate */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Freelancer"
        size="md"
      >
        <form onSubmit={handleAddMember} className="add-teammate-form">
          <p className="modal-desc">Enter the freelancer's email or phone number to find them on Lumière and send an invite.</p>

          
          <div className="form-group">
            <label>Email Address</label>
            <div style={{display:'flex', gap: 8}}>
              <input 
                type="email" 
                className="input-field" 
                required
                value={addForm.email}
                onChange={(e) => {
                  setAddForm({...addForm, email: e.target.value});
                  if (e.target.value.includes('@')) handleEmailCheck(e.target.value);
                }}
                placeholder="e.g. name@example.com"
                autoFocus
              />
            </div>
          </div>

          {isCheckingEmail && (
            <div style={{fontSize:12, color:'var(--accent-blue)', marginTop:-8, marginBottom:16}}>Searching for freelancer...</div>
          )}

          {foundUser ? (
            <div className="found-user-card" style={{
              background: 'var(--accent-blue-soft)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--accent-blue)'
            }}>
              <Avatar name={foundUser.full_name || foundUser.email} size="sm" />
              <div>
                <div style={{fontWeight:600, fontSize:14}}>{foundUser.full_name || foundUser.email}</div>
                <div style={{fontSize:12, color:'var(--text-secondary)'}}>{foundUser.category} · {foundUser.city}</div>
              </div>
            </div>
          ) : addForm.email.includes('@') && !isCheckingEmail && (
            <div style={{fontSize:12, color:'var(--accent-rose)', marginTop:-8, marginBottom:16}}>
              No registered user found with this email.
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => {
              setShowAddModal(false);
              setFoundUser(null);
            }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !foundUser}>
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Teammate */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Photographer Info"
        size="md"
      >
        <form onSubmit={handleUpdateMember} className="add-teammate-form">
          <p className="modal-desc">Update how this freelancer appears in your team. Email cannot be changed.</p>

          
          <div className="form-group">
            <label>Photographer Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select 
                className="input-field"
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
              >
                <option value="Lead">Lead</option>
                <option value="Traditional">Traditional</option>
                <option value="Candid">Candid</option>
                <option value="Drone">Drone</option>
                <option value="Reel">Reel</option>
                <option value="Cinematographer">Cinematographer</option>
                <option value="Assistant">Assistant</option>
                <option value="Helper">Helper</option>
                <option value="Creative Director">Creative Director</option>
                <option value="Other">Other</option>


              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                className="input-field"
                value={editForm.city}
                onChange={(e) => setEditForm({...editForm, city: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Quick Job Invitation */}
      {isInviteModalOpen && createPortal(
        <JobSelectionModal 
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          photographer={memberToInvite}
          onSelect={() => {
            addToast('Project request sent successfully!');
            setIsInviteModalOpen(false);
          }}
        />,
        document.body
      )}
    </div>
  );
}
