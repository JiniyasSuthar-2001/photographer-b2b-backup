// ==================================================================================
// REDUCER: STATE TRANSITIONS
// Purpose: Pure function that handles all state changes for the AppContext.
// Impact: Any action dispatched via useApp() flows through here.
// Connected Pages: All frontend pages (Dashboard, Projects, Team, etc.)

// ==================================================================================

import { emptyInitialState } from '../data/mockData';

export function reducer(state, action) {
  switch (action.type) {


    // ── User ──────────────────────────────────────────────────────────────────
    case 'SET_USER_NAME':
      return { ...state, user: { ...state.user, name: action.payload } };

    case 'SET_USER_EMAIL':
      return { ...state, user: { ...state.user, email: action.payload } };

    case 'SET_PHONE':
      return { ...state, user: { ...state.user, phone: action.payload } };

    case 'SET_MODE':
      return { ...state, user: { ...state.user, mode: action.payload } };

    case 'SET_AUTHORITY':
      return { ...state, user: { ...state.user, authority: action.payload } };

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'DISMISS_TRIAL_MODAL': {
      const updatedUser = { ...state.user, trialModalDismissed: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { ...state, user: updatedUser };
    }

    // ── Jobs ──────────────────────────────────────────────────────────────────
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload } : j),
      };

    case 'ASSIGN_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id === action.payload.jobId
            ? { ...j, assignedTo: action.payload.memberId, status: 'assigned' }
            : j
        ),
      };

    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) };

    // ── Job Requests ──────────────────────────────────────────────────────────
    case 'SEND_JOB_REQUEST':
      return {
        ...state,
        jobRequests: [action.payload, ...state.jobRequests],
      };

    case 'RESPOND_JOB_REQUEST': {
      const { id, status, payment } = action.payload;
      return {
        ...state,
        jobRequests: state.jobRequests.map(r =>
          r.id === id
            ? { ...r, status, payment: payment ?? r.payment, respondedAt: new Date().toISOString() }
            : r
        ),
        // If accepted, mark job as assigned
        jobs: status === 'accepted'
          ? state.jobs.map(j => {
              const req = state.jobRequests.find(r => r.id === id);
              return req && j.id === req.jobId ? { ...j, status: 'assigned' } : j;
            })
          : state.jobs,
      };
    }

    case 'DELETE_AVAILABILITY':
      const newAvail = { ...state.availability };
      delete newAvail[action.payload];
      return { ...state, availability: newAvail };

    case 'ADD_TASK':
      return { ...state, jobTasks: [...state.jobTasks, action.payload] };
    
    case 'TOGGLE_TASK':
      return { ...state, jobTasks: state.jobTasks.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t) };
    
    case 'UPDATE_TASK':
      return { ...state, jobTasks: state.jobTasks.map(t => t.id === action.payload.id ? { ...t, text: action.payload.text } : t) };
    
    case 'DELETE_TASK':
      return { ...state, jobTasks: state.jobTasks.filter(t => t.id !== action.payload) };

    case 'CANCEL_ACCEPTED_REQUEST':
      return {
        ...state,
        jobRequests: state.jobRequests.map(r => 
          r.id === action.payload ? { ...r, status: 'cancelled', respondedAt: new Date().toISOString() } : r
        ),
      };

    // ── Team ──────────────────────────────────────────────────────────────────
    case 'ADD_TEAM_MEMBER':
      return { ...state, team: [...state.team, action.payload] };

    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        team: state.team.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m),
      };

    // ── Calendar ──────────────────────────────────────────────────────────────
    case 'SET_AVAILABILITY':
      return {
        ...state,
        availability: { ...state.availability, [action.payload.date]: action.payload.status },
      };

    case 'TOGGLE_AVAILABILITY': {
      const current = state.availability[action.payload] || 'available';
      const cycle = { available: 'blocked', blocked: 'available', booked: 'booked', partial: 'available' };
      return {
        ...state,
        availability: { ...state.availability, [action.payload]: cycle[current] },
      };
    }

    case 'UPDATE_CALENDAR_ROLES':
      return {
        ...state,
        calendarRoles: {
          ...state.calendarRoles,
          [action.payload.date]: action.payload.roles,
        },
      };

    // ── Photographer Profile ────────────────────────────────────────────────────
    case 'UPDATE_PHOTOGRAPHER_PROFILE':
      return {
        ...state,
        photographerProfile: { ...state.photographerProfile, ...action.payload },
      };

    case 'ADD_EQUIPMENT': {
      const newItem = { id: Date.now(), ...action.payload };
      return {
        ...state,
        photographerProfile: {
          ...state.photographerProfile,
          equipment: [...state.photographerProfile.equipment, newItem],
        },
      };
    }

    case 'REMOVE_EQUIPMENT':
      return {
        ...state,
        photographerProfile: {
          ...state.photographerProfile,
          equipment: state.photographerProfile.equipment.filter(e => e.id !== action.payload),
        },
      };

    // ── ECOSYSTEM & ROLES ────────────────────────────────────────────────────
    case 'SET_DASHBOARD_ROLE':
      return { ...state, activeDashboardRole: action.payload };

    case 'SET_MAIN_TAB':
      return { ...state, activeMainTab: action.payload };

    case 'SET_SUB_TAB':
      return { ...state, activeSubTab: action.payload };


    case 'SET_ANALYTICS_ROLE':
      return { ...state, analyticsRole: action.payload };

    case 'SET_ANALYTICS_TIMEFRAME':
      return { ...state, analyticsTimeframe: action.payload };

    case 'SET_JOBS':
      return { ...state, jobs: action.payload };

    case 'SET_JOB_REQUESTS':
      return { ...state, jobRequests: action.payload };

    case 'SET_TEAM':
      return { ...state, team: action.payload };

    case 'SET_TASKS':
      return { ...state, jobTasks: action.payload };

    // ── Toasts ────────────────────────────────────────────────────────────────
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };

    // --- REFINED NOTIFICATIONS ---
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read).length
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      };

    case 'CLEANUP_EXPIRED_NOTIFICATIONS': {
      const threshold = action.payload;
      const filtered = state.notifications.filter(n => new Date(n.created_at).getTime() > threshold);
      if (filtered.length === state.notifications.length) return state; // Optimization: no change
      return {
        ...state,
        notifications: filtered,
        unreadCount: filtered.filter(n => !n.is_read).length
      };
    }

    // ── Reset ─────────────────────────────────────────────────────────────────
    case 'RESET_ALL':
      return emptyInitialState;

    default:
      return state;
  }
}
