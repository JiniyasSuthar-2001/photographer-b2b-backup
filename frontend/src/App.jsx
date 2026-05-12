import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, usePermission } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';

import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Team from './pages/Team';
import Notes from './pages/Notes';
import Pricing from './pages/Pricing';
import AuthPage from './pages/AuthPage';
import ScrollToTop from './components/utils/ScrollToTop';
import { useWebSockets } from './hooks/useWebSockets';
import './styles/global.css';
import './styles/components.css';

const STORAGE_KEY = 'events:v1';

// Real-time connection wrapper
function RealTimeProvider({ children }) {
  try {
    useWebSockets(); // Establishes connection between users and pages
  } catch (e) {
    console.error("WebSocket initialization failed:", e);
  }
  return children;
}

// Authentication Guard Component
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  // If no token exists, redirect to the login/auth page
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  // If token exists, render the Layout + Children
  return <Layout>{children}</Layout>;
}

function AnalyticsGuard() {
  const { canViewAnalytics } = usePermission();
  if (!canViewAnalytics) return <Navigate to="/" replace />;
  return <Analytics />;
}

export default function App() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setEvents(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  return (
    <AppProvider>
      <RealTimeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Auth Route is separate from Layout */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes wrapped in RequireAuth */}
            <Route path="/"          element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/projects"  element={<RequireAuth><Projects mode="my-jobs" /></RequireAuth>} />
            <Route path="/other-projects" element={<RequireAuth><Projects mode="accepted-jobs" /></RequireAuth>} />
            <Route path="/team"      element={<RequireAuth><Team /></RequireAuth>} />
            <Route path="/calendar"  element={<RequireAuth><Calendar /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><AnalyticsGuard /></RequireAuth>} />
            <Route path="/notes"     element={<RequireAuth><Notes /></RequireAuth>} />
            <Route path="/profile"   element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/pricing"   element={<RequireAuth><Pricing /></RequireAuth>} />
            
            {/* Fallback */}
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RealTimeProvider>
    </AppProvider>
  );
}
