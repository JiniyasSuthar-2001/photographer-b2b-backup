// ==================================================================================
// API SERVICE LAYER
// Purpose: Centralized handling of all backend communication.
// Connects to: FastAPI Backend (backend/routers/*)
// ==================================================================================

import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attaches JWT token to every request if available.
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- ERROR HANDLING INTERCEPTOR ---
// Automatically handles 401 Unauthorized by clearing session and redirecting.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Impact: Prevents infinite loading/error loops by forcing re-auth.
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// --- AUTH SERVICE ---
// Connects to: backend/routers/auth.py
export const authService = {
    login: async (username, password) => {
        // Impact: Critical for access. Stores token in localStorage.
        const response = await apiClient.post('/auth/login', { username, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    signup: async (data) => {
        const response = await apiClient.post('/auth/signup', data);
        return response.data;
    },
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Impact: Clears session. Redirects user to login via state change.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    updateProfile: async (data) => {
        // Updates user profile in backend and local storage.
        const response = await apiClient.put('/auth/profile', data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
};

// --- NOTIFICATION SERVICE ---
// Connects to: backend/routers/notifications.py
// Used in: NotificationBell.jsx
export const notificationService = {
    getNotifications: async (page = 1, limit = 20) => {
        // Called by Polling mechanism in NotificationBell.jsx every 30s.
        const response = await apiClient.get(`/notifications/?page=${page}&limit=${limit}`);
        return response.data;
    },
    markAsRead: async (id) => {
        // Triggered when clicking a notification in the bell dropdown.
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data;
    }
};

// --- JOB SERVICE ---
// Connects to: backend/routers/jobs.py
// Used in: Projects.jsx (My Jobs tab)

export const jobService = {
    getJobs: async () => {
        // Fetches list for Studio Owners. 
        // Logic Risk: Projects.jsx filters these based on 'accepted_count'.

        const response = await apiClient.get('/projects/');
        return response.data;
    },
    createJob: async (data) => {
        const response = await apiClient.post('/projects/', data);
        return response.data;
    },
    updateJob: async (id, data) => {
        const response = await apiClient.put(`/projects/${id}`, data);
        return response.data;
    },
    deleteJob: async (id) => {
        const response = await apiClient.delete(`/projects/${id}`);
        return response.data;
    }

};

// --- REQUEST SERVICE ---
// Connects to: backend/routers/requests.py
// Used in: Projects.jsx (Accepted Jobs/Invites tabs)

export const requestService = {
    getInvites: async () => {
        // Populates 'Invites' tab for Photographers.
        const response = await apiClient.get('/requests/?role=receiver&status=pending');
        return response.data;
    },
    getDeclinedInvites: async () => {
        // Populates 'Declined Jobs' tab for Photographers.
        const response = await apiClient.get('/requests/?role=receiver&status=declined');
        return response.data;
    },
    getAcceptedJobs: async () => {
        // Populates 'Accepted Jobs' tab for Photographers.
        const response = await apiClient.get('/requests/accepted-jobs');
        return response.data;
    },
    sendRequest: async (data) => {
        // Triggered by 'Send Request' modal in Team.jsx.
        const response = await apiClient.post('/requests/', data);
        return response.data;
    },
    respondToRequest: async (id, status) => {
        // Triggered by Accept/Decline buttons. 
        // Logic Risk: Redirects to /requests/{id}?status=...
        const response = await apiClient.patch(`/requests/${id}?status=${status}`);
        return response.data;
    },
    getRequestsByJob: async (jobId) => {
        const response = await apiClient.get(`/requests/job/${jobId}`);
        return response.data;
    },
    cancelRequest: async (id) => {
        const response = await apiClient.delete(`/requests/${id}`);
        return response.data;
    }
};

// --- TEAM SERVICE ---
// Connects to: backend/routers/team.py
// Used in: Projects.jsx (CollaborationModal)

export const teamService = {
    getTeam: async () => {
        // Fetches the studio owner's team directory.
        const response = await apiClient.get('/team/');
        return response.data;
    },
    getCollaborations: async (memberId, page = 1) => {
        // Fetches shared work history for the Collaboration Modal.
        const response = await apiClient.get(`/team/collaborations/${memberId}?page=${page}&limit=10`);
        return response.data;
    },
    discoverPhotographers: async (params) => {
        const response = await apiClient.get('/team/discover', { params });
        return response.data;
    },
    sendTeamRequest: async (data) => {
        const response = await apiClient.post('/team/request', data);
        return response.data;
    },
    getPendingRequests: async () => {
        const response = await apiClient.get('/team/requests/pending');
        return response.data;
    },
    getJoinedTeams: async () => {
        const response = await apiClient.get('/team/joined');
        return response.data;
    },
    respondToTeamRequest: async (id, status) => {
        const response = await apiClient.patch(`/team/request/${id}?status=${status}`);
        return response.data;
    }
};

// --- TASK SERVICE ---
// Connects to: backend/routers/tasks.py
// Used in: Notes.jsx
export const taskService = {
    getTasks: async () => {
        const response = await apiClient.get('/tasks/');
        return response.data;
    },
    createTask: async (data) => {
        const response = await apiClient.post('/tasks/', data);
        return response.data;
    },
    updateTask: async (id, data) => {
        const response = await apiClient.put(`/tasks/${id}`, data);
        return response.data;
    },
    deleteTask: async (id) => {
        const response = await apiClient.delete(`/tasks/${id}`);
        return response.data;
    }
};

// --- SUBSCRIPTION SERVICE ---
export const subscriptionService = {
    purchase: async (planName, amount) => {
        // Impact: Critical for payment processing.
        // Differentiates between 'id' (payment record) and 'user_id' in backend response.
        const response = await apiClient.post('/subscription/purchase', { plan_name: planName, amount });
        return response.data;
    },
    getStatus: async () => {
        const response = await apiClient.get('/subscription/status');
        return response.data;
    }
};

// --- REFERRAL SERVICE ---
// Connects to: backend/routers/referral.py
export const referralService = {
    getInfo: async () => {
        const response = await apiClient.get('/referral/info');
        return response.data;
    },
    applyCode: async (code) => {
        const response = await apiClient.post('/referral/apply', { referral_code: code });
        return response.data;
    }
};

// --- SYSTEM SERVICE ---
// Connects to: backend/routers/system.py
export const systemService = {
    resetDatabase: async () => {
        const response = await apiClient.post('/system/reset-db');
        return response.data;
    }
};

// --- ANALYTICS SERVICE ---
// Connects to: backend/routers/analytics.py
export const analyticsService = {
    getAnalytics: async () => {
        const response = await apiClient.get('/analytics/');
        return response.data;
    },
    getRankings: async () => {
        const response = await apiClient.get('/analytics/rankings');
        return response.data;
    }
};

// --- CALENDAR SERVICE ---
// Connects to: backend/routers/calendar.py
export const calendarService = {
    getRoster: async () => {
        const response = await apiClient.get('/calendar/roster');
        return response.data;
    },
    updateAvailability: async (data) => {
        const response = await apiClient.post('/calendar/availability', data);
        return response.data;
    }
};

// --- DASHBOARD SERVICE ---
// Connects to: backend/routers/dashboard.py
export const dashboardService = {
    getSummary: async () => {
        const response = await apiClient.get('/dashboard/summary');
        return response.data;
    }
};

export default apiClient;
