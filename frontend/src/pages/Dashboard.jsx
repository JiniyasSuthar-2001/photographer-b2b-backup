// ==================================================================================
// PAGE: DASHBOARD
// Purpose: High-level overview of the photography ecosystem for both roles.
// Connected Pages: 
// - Projects.jsx (Linked via interactive StatCards)
// - Analytics.jsx (Linked via the Earnings StatCard)
// Role Architecture:
// - Photographer Mode: Focuses on managed jobs and revenue.
// - Freelancer Mode: Focuses on incoming requests and payouts.
// ==================================================================================

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  IndianRupee, Briefcase, Eye, Calendar,
  ArrowRight, MapPin, Clock, Check, X,
  Bell, AlertCircle, Plus, Camera, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { requestService } from '../services/api';
import { ROLE_TYPES } from '../data/mockData';
import { sortChronologically } from '../utils/sorting';
import './Dashboard.css';

const REQUEST_STATUS_STYLES = {
  pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Pending'  },
  accepted: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Accepted' },
  declined: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',   label: 'Declined' },
};

export default function Dashboard() {
  const { state, dispatch, addToast } = useApp();
  const { 
    jobs, 
    jobRequests, 
    analytics, 
    activeDashboardRole,
    user
  } = state;

  // --- CORE DATA PROCESSING ---
  const isPhotographerMode = activeDashboardRole === 'photographer';

  // CHRONOLOGICAL SORTING
  const myOwnedJobs = sortChronologically(jobs.filter(j => j.status !== 'cancelled'), 'date').slice(0, 4);
  const myIncomingRequests = sortChronologically(jobRequests.filter(r => r.status === 'pending'), 'job_date').slice(0, 4);
  
  // Stats calculation
  const pendingCount = jobRequests.filter(r => r.status === 'pending').length;
  const activeAssignmentsCount = jobRequests.filter(r => r.status === 'accepted').length;
  
  const currentEarnings = isPhotographerMode 
    ? ((analytics.photographerEarnings[analytics.photographerEarnings.length - 1]?.amount || 0) * 1.5) 
    : (analytics.photographerEarnings[analytics.photographerEarnings.length - 1]?.amount || 0);

  // --- NEXT WEEK WORK ---
  const nextWeekWork = sortChronologically([
    ...jobs.filter(j => j.status === 'assigned').map(j => ({ ...j, type: 'owned' })),
    ...jobRequests.filter(r => r.status === 'accepted').map(r => ({ ...r, title: r.jobTitle, date: r.job_date, type: 'freelance' }))
  ], 'date').slice(0, 4);

  const navigate = useNavigate();

  const handleRoleToggle = (role) => {
    dispatch({ type: 'SET_DASHBOARD_ROLE', payload: role });
    addToast(`Switched to ${role === 'photographer' ? 'Photographer' : 'Freelancer'} view`);
  };

  const navigateToProjects = (mainTab, subTab = 'accepted') => {
    dispatch({ type: 'SET_MAIN_TAB', payload: mainTab });
    dispatch({ type: 'SET_SUB_TAB', payload: subTab });
    navigate('/projects');
  };

  const handleDismissTrial = () => {
    dispatch({ type: 'DISMISS_TRIAL_MODAL' });
  };

  const handleAccept = async (req) => {
    try {
      await requestService.respondToRequest(req.id, 'accepted');
      dispatch({ type: 'RESPOND_JOB_REQUEST', payload: { id: req.id, status: 'accepted' } });
      addToast(`✅ Accepted: ${req.jobTitle}`, 'success');
    } catch (err) {
      addToast('Failed to accept request', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-actions">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user.full_name || user.username}</h1>
          <p>Here's what's happening with your {(user.user_type || '').replace('_', ' ')} account.</p>
        </div>
        <div className="role-toggle-group">
          <button 
            className={`role-toggle-btn ${isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleToggle('photographer')}
          >
            <Camera size={16} />
            Photographer
          </button>
          <button 
            className={`role-toggle-btn ${!isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleToggle('freelancer')}
          >
            <Sparkles size={16} />
            Freelancer
          </button>
        </div>
      </div>

      <div className="grid-3 dashboard-stats-row">
        <div 
          onClick={() => navigateToProjects(isPhotographerMode ? 'my-jobs' : 'accepted-jobs', isPhotographerMode ? 'assigned' : 'invites')} 
          className="clickable-stat"
        >
          <StatCard 
            label={isPhotographerMode ? "Managed Jobs" : "Pending Requests"} 
            value={isPhotographerMode ? jobs.length : pendingCount} 
            icon={<Bell size={18} style={{color:'#F43F5E'}}/>} 
            iconBg="rgba(244,63,94,0.1)"
          />
        </div>
        <div 
          onClick={() => navigateToProjects(isPhotographerMode ? 'my-jobs' : 'accepted-jobs', 'accepted')} 
          className="clickable-stat"
        >
          <StatCard 
            label="Active Assignments" 
            value={activeAssignmentsCount} 
            icon={<Briefcase size={18} style={{color:'#3B82F6'}}/>} 
            iconBg="rgba(59,130,246,0.1)"
          />
        </div>
        <div onClick={() => navigate('/analytics')} className="clickable-stat">
          <StatCard 
            label="Earnings This Month" 
            value={`₹${Math.round(currentEarnings).toLocaleString()}`} 
            change="12.4%" 
            changeDir="up" 
            icon={<IndianRupee size={18} style={{color:'#10B981'}}/>} 
            iconBg="rgba(16,185,129,0.1)"
          />
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-content-left">
          <div className="card card-padding mode-section">
            <div className="section-header">
              <h2 className="section-title">
                {isPhotographerMode ? 'My Jobs (Photography)' : 'My Requests (Freelance)'}
              </h2>
              <button 
                onClick={() => navigateToProjects(isPhotographerMode ? 'my-jobs' : 'accepted-jobs')} 
                className="view-all-link-btn"
              >
                View Hub <ArrowRight size={14} />
              </button>
            </div>
            <div className="mode-items-list">
              {isPhotographerMode ? (
                myOwnedJobs.length === 0 ? (
                  <EmptyState 
                    title="No Photography Jobs" 
                    message="You haven't created any jobs for your business yet."
                    action={<NavLink to="/projects" className="btn btn-primary btn-sm">Post a Job</NavLink>}
                  />
                ) : myOwnedJobs.map(job => (
                  <div key={job.id} className="ecosystem-card">
                    <div className="eco-card-top">
                      <div className="eco-title">{job.title}</div>
                      <div className="eco-status-badge">{job.status}</div>
                    </div>
                    <div className="eco-meta">
                      <span><MapPin size={12}/> {job.location || 'Ahmedabad, IN'}</span>
                      <span><Calendar size={12}/> {new Date(job.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                myIncomingRequests.length === 0 ? (
                  <EmptyState 
                    title="No Incoming Requests" 
                    message="You don't have any freelance job requests right now."
                  />
                ) : myIncomingRequests.map(req => (
                  <div key={req.id} className="ecosystem-card highlight">
                    <div className="eco-card-top">
                      <div>
                        <div className="eco-title">{req.jobTitle}</div>
                        <div className="eco-subtitle">From {req.sentBy}</div>
                      </div>
                      <div className="eco-price">₹{req.budget.toLocaleString()}</div>
                    </div>
                    <div className="redesigned-card-footer">
                      <button className="btn-mini btn-primary" onClick={() => handleAccept(req)}>Accept</button>
                      <button className="btn-mini btn-outline" onClick={() => navigateToProjects('accepted-jobs', 'invites')}>View</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── ACTIVE ASSIGNMENTS ─── */}
          <div className="card card-padding">
            <div className="section-header">
              <h2 className="section-title">Current Assignments</h2>
            </div>
            {activeAssignmentsCount === 0 ? (
              <EmptyState 
                title="No Active Assignments" 
                message="Your schedule is clear for today."
              />
            ) : (
              <div className="assignments-compact">
                {jobRequests.filter(r => r.status === 'accepted').slice(0, 3).map(req => (
                  <div key={req.id} className="assignment-row">
                    <div className="assignment-info">
                      <div className="assign-title">{req.jobTitle}</div>
                      <div className="assign-role">{req.role}</div>
                    </div>
                    <div className="assign-date">{req.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-content-right">
          {/* ─── NEXT WEEK WORK (COMBINED) ─── */}
          <div className="card card-padding next-week-panel">
            <div className="card-header">
              <div className="card-title">Next Week Work</div>
              <p className="card-subtitle">Studio + Freelance schedule</p>
            </div>
            <div className="next-week-list">
              {nextWeekWork.length === 0 ? (
                <div className="empty-mini">Clear schedule for next week.</div>
              ) : nextWeekWork.map((item, idx) => (
                <div key={idx} className={`next-week-item ${item.type}`}>
                  <div className="item-type-tag">{item.type}</div>
                  <div className="item-title">{item.title}</div>
                  <div className="item-date"><Clock size={10} /> {item.date}</div>
                </div>
              ))}
            </div>
          </div>

          <MiniCalendar />
        </div>
      </div>

      {/* Floating Action Button - Connected to Job Hub creation */}
      {isPhotographerMode && createPortal(
        <NavLink to="/projects" className="fab-ecosystem">
          <Plus size={20} />
          Create New Project
        </NavLink>,

        document.body
      )}


      {/* Welcome Popup - Only shows once after login/signup */}
      {user.isOnTrial && !user.trialModalDismissed && createPortal(
        <div className="modal-overlay" style={{zIndex:2000}}>
          <div className="modal card-padding" style={{maxWidth:400,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>✨</div>
            <h2 style={{margin:'0 0 8px 0'}}>Welcome to Lumière</h2>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24,lineHeight:1.5}}>
              Your complete photography management platform. Manage your jobs, team, and bookings all in one place.
            </p>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleDismissTrial}>
              Get Started
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MiniCalendar() {
  const { state } = useApp();
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();
  const AVAIL_COLORS = { booked:'#3B82F6', available:'#10B981', partial:'#F59E0B', blocked:'#F43F5E' };
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = ['S','M','T','W','T','F','S'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="card card-padding mini-calendar">
      <div className="card-header">
        <div className="card-title">
          {MONTHS[month]} {year}
        </div>
      </div>
      <div className="mini-cal-grid-header" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8}}>
        {DAYS.map((d,i)=><div key={i}>{d}</div>)}
      </div>
      <div className="mini-cal-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4}}>
        {Array.from({length:firstDay},(_, i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const day = i + 1;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const avail   = state.availability[dateStr];
          const isToday = day === today.getDate();
          return (
            <div key={day} style={{textAlign: 'center', padding: '6px 0', borderRadius: 4, background: isToday ? 'var(--surface-hover)' : 'transparent', fontWeight: isToday ? 700 : 500, fontSize: 12}}>
              <span>{day}</span>
              {avail && <div style={{width:4,height:4,borderRadius:'50%',background:AVAIL_COLORS[avail],margin:'2px auto 0'}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
