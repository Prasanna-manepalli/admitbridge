import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  LayoutDashboard, UserCircle, Briefcase, Globe, Settings,
  GraduationCap, LogOut,
} from 'lucide-react';
import './consultant.css';

const NAV_ITEMS = [
  { to: '/consultant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/consultant/profile', label: 'My Profile', icon: UserCircle },
  { to: '/consultant/services', label: 'Services', icon: Briefcase },
  { to: '/consultant/public-preview', label: 'Public Profile Preview', icon: Globe },
  { to: '/consultant/settings', label: 'Account Settings', icon: Settings },
];

/**
 * Light-themed shell for the consultancy area: white sidebar + top nav,
 * light gray content background. Scoped styles live in ./consultant.css.
 */
const ConsultantLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="cns-layout">
      <aside className="cns-sidebar">
        <div className="cns-sidebar-title">Consultancy</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `cns-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <div className="cns-sidebar-footer">
          AdmitBridge Consultancy Suite
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header className="cns-topbar">
          <div className="cns-topbar-left">
            <span className="cns-brand-mark"><GraduationCap size={18} /></span>
            AdmitBridge <span style={{ fontWeight: 500, color: '#6b7280' }}>| Consultant</span>
          </div>
          <div className="cns-topbar-right">
            <div className="cns-user-chip">
              <span>{user?.name}</span>
              <span className="cns-avatar">
                {(user?.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="cns-btn cns-btn-outline" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        <main className="cns-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsultantLayout;
