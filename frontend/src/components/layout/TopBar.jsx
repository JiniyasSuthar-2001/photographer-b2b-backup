import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../ui/Avatar';
import NotificationBell from './NotificationBell';
import './TopBar.css';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/projects':  'Projects',

  '/calendar':  'Calendar',
  '/analytics': 'Analytics',
  '/profile':   'Profile',
};

const PAGE_TITLES_PHOTOGRAPHER = {
  '/':          'Dashboard',
  '/projects':  'Projects',

  '/calendar':  'My Calendar',
  '/profile':   'Profile',
};

export default function TopBar() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const location = useLocation();

  const titles = user.mode === 'photographer' ? PAGE_TITLES_PHOTOGRAPHER : PAGE_TITLES;
  const title = titles[location.pathname] || 'Lumière';

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.02 + 'em' }}>{title}</h1>
        <span className="topbar-greeting">
          Welcome back, {(user.full_name || user.username || '').split(' ')[0]} ✦
        </span>
      </div>

      <div className="topbar-right">
        {/* Mode Chip */}
        <div className="topbar-mode-chip">
          <span className="topbar-mode-dot" />
          {user.mode === 'photographer' ? 'Photographer' : 'Studio Owner'}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}

        {/* Avatar */}
        <Avatar name={user.full_name || user.username} size="sm" />
      </div>
    </header>
  );
}
