import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { jobService, teamService, requestService, taskService } from '../services/api';

/**
 * HOOK: useWebSockets
 * Purpose: Provides a 'Proper Connection' between the backend events and the UI pages.
 * Connection: Listens for real-time broadcasts and updates the global state or shows toasts.
 */
export function useWebSockets() {
  const { state, dispatch, addToast } = useApp();
  const socketRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const heartbeatInterval = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !state.user) return;

    // Connect to backend WebSocket
    // Note: We use window.location.hostname to handle both localhost and network IPs
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : `${window.location.hostname}:8000`;

    // If we are in production/build, we might use the relative /ws path (proxied)
    // For development, we might need to point directly to the backend port if not proxied
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    console.log('🔌 Attempting WebSocket connection...');
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ Real-time connection established (WebSocket)');
      setRetryCount(0);

      // Start Heartbeat (Ping)
      heartbeatInterval.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'PING' }));
        }
      }, 30000); // Every 30 seconds
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'PONG') return;

      console.log('✉️ Received real-time event:', message);

      switch (message.type) {
        case 'NEW_NOTIFICATION':
          addToast(message.data.message, 'info');
          dispatch({ type: 'ADD_NOTIFICATION', payload: message.data });
          break;

        case 'REFRESH_PAGE':
          console.log(`🔄 Triggering refresh for page: ${message.page}`);
          refreshData(message.page);
          break;

        case 'SUBSCRIPTION_UPDATED':
          addToast(message.payload.message || 'Subscription upgraded!', 'success');
          dispatch({ type: 'UPDATE_USER', payload: message.payload });
          break;

        case 'referral_reward_received':
          addToast(message.message, 'success');
          if (message.new_expiry_date) {
            dispatch({ type: 'UPDATE_USER', payload: { subscription_expiry: message.new_expiry_date } });
          }
          break;

        case 'payment_success':
          addToast('Payment processed successfully!', 'success');
          dispatch({
            type: 'UPDATE_USER', payload: {
              plan: message.plan,
              subscription_expiry: message.new_expiry,
              is_pro: true,
              first_purchase_completed: true
            }
          });
          break;

        case 'TOAST':
          addToast(message.message, message.toastType || 'info');
          break;

        default:
          break;
      }
    };

    socket.onclose = () => {
      console.log('❌ Real-time connection closed');
      clearInterval(heartbeatInterval.current);

      // Automatic Reconnection with exponential backoff
      const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.log(`⏳ Retrying connection in ${timeout / 1000}s...`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, timeout);
    };

    socket.onerror = (err) => {
      console.error('⚠️ WebSocket error:', err);
      socket.close();
    };
  }, [state.user?.id, retryCount]);

  const refreshData = async (page) => {
    try {
      if (page === 'projects') {
        const jobs = await jobService.getJobs();
        dispatch({ type: 'SET_JOBS', payload: jobs });
      } else if (page === 'team') {
        const team = await teamService.getTeam();
        dispatch({ type: 'SET_TEAM', payload: team });
      } else if (page === 'invites') {
        const [invites, accepted] = await Promise.all([
          requestService.getInvites(),
          requestService.getAcceptedJobs()
        ]);
        dispatch({ type: 'SET_JOB_REQUESTS', payload: [...invites, ...accepted] });
      } else if (page === 'tasks') {
        const tasks = await taskService.getTasks();
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } else if (page === 'calendar') {
        // Calendar logic in frontend often uses local state + refetch
        // We'll trigger a refresh by just re-fetching if we had a setter, 
        // or the calendar component will handle it on re-mount/re-render.
        // For now, we'll log it.
        console.log("Calendar refresh triggered");
      }
    } catch (err) {
      console.error(`Refresh failed for ${page}:`, err);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(heartbeatInterval.current);
    };
  }, [state.user?.id, retryCount]);

  return socketRef.current;
}
