import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { jobService, teamService, requestService } from '../services/api';

/**
 * HOOK: useWebSockets
 * Purpose: Provides a 'Proper Connection' between the backend events and the UI pages.
 * Connection: Listens for real-time broadcasts and updates the global state or shows toasts.
 */
export function useWebSockets() {
  const { state, dispatch, addToast } = useApp();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is logged in
    const token = localStorage.getItem('token');
    if (!token || !state.user) return;

    // Connect to backend WebSocket
    //const wsUrl = `ws://[IP_ADDRESS]/ws?token=${token}`;
    const wsUrl = `ws://localhost:8000/ws?token=${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ Real-time connection established (WebSocket)');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('✉️ Received real-time event:', message);

      switch (message.type) {
        case 'NEW_NOTIFICATION':
          // 1. Show a toast instantly
          addToast(message.data.message, 'info');
          // 2. Update global state so the Bell icon reflects the change
          dispatch({ type: 'ADD_NOTIFICATION', payload: message.data });
          break;
        
        case 'REFRESH_PAGE':
          console.log(`🔄 Triggering refresh for page: ${message.page}`);
          if (message.page === 'projects') {
            jobService.getJobs().then(jobs => dispatch({ type: 'SET_JOBS', payload: jobs }));

          } else if (message.page === 'team') {
            teamService.getTeam().then(team => dispatch({ type: 'SET_TEAM', payload: team }));
          } else if (message.page === 'invites') {
            // Refresh both invites and accepted jobs for photographer
            Promise.all([
              requestService.getInvites(),
              requestService.getAcceptedJobs()
            ]).then(([invites, accepted]) => {
              dispatch({ type: 'SET_JOB_REQUESTS', payload: [...invites, ...accepted] });
            });
          }
          break;

        case 'SUBSCRIPTION_UPDATED':
          console.log('💎 Subscription updated:', message.payload);
          addToast(message.payload.message || 'Subscription upgraded!', 'success');
          dispatch({ type: 'UPDATE_USER', payload: message.payload });
          break;

        case 'referral_reward_received':
          console.log('🎁 Referral reward received:', message);
          addToast(message.message, 'success');
          // Update user expiry in state if provided
          if (message.new_expiry_date) {
            dispatch({ type: 'UPDATE_USER', payload: { subscription_expiry: message.new_expiry_date } });
          }
          break;

        case 'payment_success':
          console.log('💰 Payment success:', message);
          addToast('Payment processed successfully!', 'success');
          dispatch({ type: 'UPDATE_USER', payload: { 
            plan: message.plan, 
            subscription_expiry: message.new_expiry,
            is_pro: true,
            first_purchase_completed: true 
          } });
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
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [state.user?.id]); // Only reconnect if identity changes

  return socketRef.current;
}
