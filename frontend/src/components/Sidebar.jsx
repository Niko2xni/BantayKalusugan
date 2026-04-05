import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  MessageSquare,
  Calendar,
  Info
} from 'lucide-react';
import styles from '../user_dashboard.module.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { to: '/analytics', label: 'Analytics', icon: <Activity /> },
  { to: '/chat', label: 'Chat', icon: <MessageSquare /> },
  { to: '/schedules', label: 'Schedules', icon: <Calendar /> },
  { to: '/help', label: 'Help', icon: <Info /> },
];

const NavItem = ({ icon, label, active }) => (
  <div
    className={styles.sidebar__item}
    style={{
      background: active ? 'rgba(46, 88, 149, 0.12)' : 'transparent',
      color: active ? '#2E5895' : undefined,
    }}
  >
    {React.cloneElement(icon, { size: 24 })}
    <span>{label}</span>
  </div>
);

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {navItems.map((item) => (
        <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
          <NavItem icon={item.icon} label={item.label} active={location.pathname === item.to} />
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
