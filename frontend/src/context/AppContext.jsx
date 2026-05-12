// ==================================================================================
// CONTEXT: APP STATE MANAGEMENT
// Purpose: Centralized "Source of Truth" for the entire platform.
// Impact: Changes here affect EVERY component using useApp() or usePermission().
// Connectivity:
// - services/api.js (Supplies the data via API calls)
// - reducer.js (Handles all state transitions)
// ==================================================================================

import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer } from './reducer';
import { getAppInitialState } from '../data/mockData';
import { jobService, requestService, notificationService, teamService, taskService } from '../services/api';


const today = new Date().toISOString().split('T')[0];
function getFirstDate(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes(',')) return dateStr.split(',')[0].trim();
  return dateStr;
}

// --- INITIAL STATE ---
// We prioritize data from localStorage for a persistent session.
const getSessionInitialState = () => {
  const savedUser = localStorage.getItem('user');
  const initialUser = savedUser ? (typeof savedUser === 'string' && savedUser !== 'undefined' ? JSON.parse(savedUser) : null) : null;
  
  const baseState = getAppInitialState(initialUser?.username);
  
  return {
    ...baseState,
    user: {
      ...baseState.user,
      ...(initialUser || {}),
      mode: initialUser?.user_type || 'photographer',
    },
    // --- CORE ECOSYSTEM STATE ---
    // ROLE SYSTEM: 
    // - photographer: (Old Studio Owner) Can post jobs, manage teams.
    // - freelancer: (Old Photographer) Can accept invites, view assigned work.
    activeDashboardRole: initialUser?.user_type || 'photographer',
    activeMainTab: 'my-jobs',
    activeSubTab: 'accepted',
    analyticsRole: initialUser?.user_type || 'photographer',

    analyticsTimeframe: '1M',

    
    // --- DYNAMIC DATA SYNC ---
    // We initialize with baseState (which contains mock data for Admin)
    // The useEffect will then overwrite this with real data from the DB.
    jobs: baseState.jobs || [],
    jobRequests: baseState.jobRequests || [],
    jobTasks: baseState.jobTasks || [],
    notifications: baseState.notifications || [],
    unreadCount: (baseState.notifications || []).filter(n => !n.read).length,
  };
};

const initialState = getSessionInitialState();

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- GLOBAL SYNC ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const syncBackendData = async () => {
      try {
        const [jobs, notifications, team, tasks] = await Promise.all([
          jobService.getJobs(),
          notificationService.getNotifications(),
          teamService.getTeam(),
          taskService.getTasks()
        ]);
        
        dispatch({ type: 'SET_JOBS', payload: jobs });
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_TEAM', payload: team });
        dispatch({ type: 'SET_TASKS', payload: tasks });

        // --- DUAL ROLE SYNC ---
        // Always fetch requests where the user is the receiver (Freelancer side)
        // regardless of their active mode, so switching views is seamless.
        const [invites, accepted] = await Promise.all([
          requestService.getInvites(),
          requestService.getAcceptedJobs()
        ]);
        
        // Map these to the standard job_title/job_date format if needed
        const processedRequests = [...invites, ...accepted].map(r => ({
          ...r,
          id: r.request_id || r.assignment_id || r.id,
          jobTitle: r.job_title || r.title,
          job_date: r.job_date || r.date,
          sentBy: r.sender_name || r.owner_name
        }));

        dispatch({ type: 'SET_JOB_REQUESTS', payload: processedRequests });

      } catch (err) {
        console.error('Initial data sync failed:', err);
      }
    };

    syncBackendData();
    
    // --- NOTIFICATION CLEANUP: Auto-remove after 2 hours ---
    const cleanupInterval = setInterval(() => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).getTime();
      dispatch({ type: 'CLEANUP_EXPIRED_NOTIFICATIONS', payload: twoHoursAgo });
    }, 60000); // Check every minute

    // --- SESSION SAFETY: Handle cross-tab login/logout ---
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        if (!e.newValue) {
          // If token was removed in another tab, logout this tab too
          window.location.href = '/auth';
        } else {
          // If token was changed (new login), refresh to sync state
          window.location.reload();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.user.id]);

  // --- UTILITY: TOAST NOTIFICATIONS ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, toastType: type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

// --- CUSTOM HOOKS ---

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// --- PERMISSION HELPERS ---
export function usePermission() {
  /**
   * Defines what a user can see/do based on their profile.
   * NOTE: Currently most permissions are hardcoded to 'true' for the demo.
   * Modification Impact: Setting 'canPostJob' to false will hide the 
   * 'Post New Job' button in Projects.jsx globally.

   */
  const { state } = useApp();
  const { user } = state;
  const authority = user.authority;
  const role = user.user_type || user.mode;

  /**
   * ROLE RENAMING ARCHITECTURE:
   * - isPhotographer (True if role === 'photographer'): This is the OLD 'studio_owner'.
   *   They have administrative power: posting jobs, inviting team members.
   * - isFreelancer (True if role === 'freelancer'): This is the OLD 'photographer'.
   *   They are the work force: applying for jobs, receiving invites.
   */
  const isPhotographer = role === 'photographer';
  const isFreelancer = role === 'freelancer';

  return {
    isPhotographer,
    isFreelancer,
    isManager:         isPhotographer && authority === 'manager',
    isStaff:           isPhotographer && authority === 'staff',
    canPostJob:        isPhotographer,
    canInviteMember:   isPhotographer,
    canMoveJob:        isPhotographer,
    canSendRequest:    isPhotographer,
    canApplyJob:       isFreelancer,
    canViewTeam:       isPhotographer,
    canViewFinancials: isPhotographer && authority === 'manager',
    canChangeAuthority:isPhotographer && authority === 'manager',
    canViewAnalytics:  true, // Open to all as per requirements
  };

}
