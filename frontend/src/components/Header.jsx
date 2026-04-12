import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';
import styles from '../user_dashboard.module.css';
import { clearAuthSession, getStoredUser } from '../utils/authSession';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../utils/patientPortalApi';
import { subscribeToNotificationsRefresh } from '../utils/notificationSync';


function formatRelativeTime(isoTimestamp) {
  const timestamp = new Date(isoTimestamp);
  if (Number.isNaN(timestamp.getTime())) {
    return '';
  }

  const diffMs = Date.now() - timestamp.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return 'Just now';
  }
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} min${mins === 1 ? '' : 's'} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const Header = () => {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : "User";
  const initial = user.first_name ? user.first_name.charAt(0) : "U";

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const dropdownRef = useRef(null);


  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const items = await fetchNotifications();
      setNotifications(Array.isArray(items) ? items : []);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications();

    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  useEffect(() => {
    return subscribeToNotificationsRefresh(() => {
      loadNotifications();
    });
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleToggleNotifications = async () => {
    const shouldOpen = !showNotifications;
    setShowNotifications(shouldOpen);
    if (shouldOpen) {
      await loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true, read_at: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Unable to mark notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Unable to mark notifications as read.');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__logo}>
        <img className={styles['navbar__logo-icon']} src={logo} alt="BantayKalusugan Logo" />
        <span>BantayKalusugan</span>
      </div>
      <div className={styles.navbar__menu}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px' }}>

          <div className={styles['notifications-wrapper']} ref={dropdownRef}>
            <button
              className={`${styles['top-header__btn']} ${styles['top-header__btn--icon']}`}
              onClick={handleToggleNotifications}
            >
              <Bell size={20} color="#4b5563" />
              {unreadCount > 0 && <span className={styles['notifications-badge']}>{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className={styles['notifications-dropdown']}>
                <div className={styles['notifications-header']}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                  <button
                    type="button"
                    className={styles['notifications-mark-all']}
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className={styles['notifications-list']}>
                  {notificationsLoading && (
                    <div className={styles['notification-item']}>
                      <div className={styles['notification-content']}>
                        <p className={styles['notification-text']}>Loading notifications...</p>
                      </div>
                    </div>
                  )}

                  {!notificationsLoading && notificationsError && (
                    <div className={styles['notification-item']}>
                      <div className={styles['notification-content']}>
                        <p className={styles['notification-text']} style={{ color: '#dc2626' }}>{notificationsError}</p>
                      </div>
                    </div>
                  )}

                  {!notificationsLoading && !notificationsError && !notifications.length && (
                    <div className={styles['notification-item']}>
                      <div className={styles['notification-content']}>
                        <p className={styles['notification-text']}>No notifications yet.</p>
                      </div>
                    </div>
                  )}

                  {!notificationsLoading && !notificationsError && notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      className={`${styles['notification-item']} ${notif.is_read ? styles['notification-item--read'] : styles['notification-item--unread']}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {!notif.is_read && <div className={styles['notification-dot']}></div>}
                      <div className={styles['notification-content']}>
                        <p className={styles['notification-text']}>
                          <strong>{notif.title}</strong> {notif.body}
                        </p>
                        <span className={styles['notification-time']}>
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                    </button>
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
