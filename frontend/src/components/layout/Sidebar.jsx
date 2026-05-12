// ==================================================================================
// COMPONENT: SIDEBAR
// Purpose: Primary navigation and role context for the application.
// Connected Pages: ALL (Persistent across the platform)
// Logic: 
// - Dynamic Badge: Reflects Photographer vs Freelancer role.
// - Notification Badge: Triggers on '/projects' when freelancer has pending requests.

// ==================================================================================

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BarChart2, UserCircle,
  Briefcase, ChevronRight, Sparkles, Settings, Lock, Camera,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../ui/Avatar';
import './Sidebar.css';


const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/other-projects', icon: Briefcase, label: 'Other Projects' },
  { path: '/team', icon: Users, label: 'Team' },

  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/notes', icon: ClipboardList, label: 'Notes' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar() {
  const { state } = useApp();
  const { user } = state;
  // Use standardized navigation for all roles

  const pendingRequests = state.jobRequests.filter(r =>
    user.mode === 'freelancer'
      ? r.status === 'pending'
      : false
  ).length;


  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={16} />
        </div>
        <span className="sidebar-logo-text">Lumière</span>
      </div>

      {/* Mode Badge (Renamed terminology) */}
      <div className="sidebar-mode-badge">
        <span>{user.mode === 'photographer' ? 'Photographer' : 'Freelancer'}</span>
        {user.authority === 'manager' && user.mode === 'photographer' && (
          <span className="sidebar-authority">Manager</span>
        )}
        {user.authority === 'staff' && user.mode === 'photographer' && (
          <span className="sidebar-authority staff">Staff</span>
        )}
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path + label}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-nav-bar" />
            <Icon size={18} className="sidebar-nav-icon" />
            <span className="sidebar-nav-label-text">{label}</span>
            {path === '/projects' && pendingRequests > 0 && (
              <span className="sidebar-nav-badge">{pendingRequests}</span>
            )}
          </NavLink>
        ))}

      </nav>

      <div style={{ flex: 1 }} />

      {/* Trial Banner */}
      {user.isOnTrial && (
        <div className="sidebar-trial">
          <div className="sidebar-trial-text">
            <strong>{user.trialDaysLeft} days</strong> left on trial
          </div>
          <NavLink to="/pricing" className="sidebar-trial-cta">Upgrade to Pro</NavLink>
        </div>
      )}

      {/* Profile */}
      <div className="sidebar-profile">
        <Avatar name={user.full_name || user.username} size="sm" />
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{user.full_name || user.username}</div>
          <div className="sidebar-profile-email">{user.email}</div>
        </div>
        <NavLink to="/profile" className="sidebar-profile-settings">
          <Settings size={15} />
        </NavLink>
      </div>
    </aside>
  );
}
