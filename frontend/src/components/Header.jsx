import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import styles from '../user_dashboard.module.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : "User";
  const initial = user.first_name ? user.first_name.charAt(0) : "U";

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "New appointment set by Admin", time: "10 mins ago", read: false },
    { id: 2, text: "Your lab results are ready to be viewed.", time: "1 hour ago", read: false },
    { id: 3, text: "Reminder: Upcoming consultation tomorrow.", time: "1 day ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__logo}>
        <div className={styles['navbar__logo-icon']}></div>
        <span>BantayKalusugan</span>
      </div>
      <div className={styles.navbar__menu}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px' }}>
          
          <div className={styles['notifications-wrapper']} ref={dropdownRef}>
            <button 
              className={`${styles['top-header__btn']} ${styles['top-header__btn--icon']}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color="#4b5563" />
              {unreadCount > 0 && <span className={styles['notification-badge']}>{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className={styles['notifications-dropdown']}>
                <div className={styles['notifications-header']}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--navy)', cursor: 'pointer' }}>Mark all as read</span>
                </div>
                <div className={styles['notifications-list']}>
                  {notifications.map(notif => (
                    <div key={notif.id} className={`${styles['notification-item']} ${!notif.read ? styles['notification-item--unread'] : ''}`}>
                      <div className={styles['notification-dot']}></div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-dark)' }}>{notif.text}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mute)' }}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/profile" className={styles['top-header__profile']}>
            <div className={styles['top-header__avatar']}>{initial}</div>
            <span className={styles['top-header__name']}>{fullName}</span>
            <ChevronDown size={16} color="#4b5563" />
          </Link>
        </div>
        <button onClick={handleLogout} className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}>Log Out</button>
      </div>
    </nav>
  );
};

export default Header;
