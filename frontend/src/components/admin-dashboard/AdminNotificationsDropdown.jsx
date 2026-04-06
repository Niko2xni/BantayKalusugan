import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { AUTH_REDIRECT_ERROR } from "../../utils/adminApi";
import {
  fetchAdminNotifications,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
} from "../../utils/adminNotificationsApi";

function formatRelativeTime(isoTimestamp) {
  const timestamp = new Date(isoTimestamp);
  if (Number.isNaN(timestamp.getTime())) {
    return "";
  }

  const diffMs = Date.now() - timestamp.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} min${mins === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function AdminNotificationsDropdown() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const items = await fetchAdminNotifications();
      setNotifications(Array.isArray(items) ? items : []);
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setNotificationsError(error instanceof Error ? error.message : "Unable to load notifications.");
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

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
  }, []);

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
      await markAdminNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true, read_at: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setNotificationsError(error instanceof Error ? error.message : "Unable to mark notification.");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setNotificationsError(error instanceof Error ? error.message : "Unable to mark notifications as read.");
      }
    }
  };

  return (
    <div className="admin-notifications-wrapper" ref={dropdownRef}>
      <button
        className="topbar-bell-btn"
        type="button"
        aria-label="Notifications"
        aria-expanded={showNotifications}
        onClick={handleToggleNotifications}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="admin-notifications-badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="admin-notifications-dropdown">
          <div className="admin-notifications-header">
            <h4 className="admin-notifications-title">Notifications</h4>
            <button
              type="button"
              className="admin-notifications-mark-all"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="admin-notifications-list">
            {notificationsLoading && (
              <div className="admin-notification-item">
                <div className="admin-notification-content">
                  <p className="admin-notification-text">Loading notifications...</p>
                </div>
              </div>
            )}

            {!notificationsLoading && notificationsError && (
              <div className="admin-notification-item">
                <div className="admin-notification-content">
                  <p className="admin-notification-text" style={{ color: "#dc2626" }}>
                    {notificationsError}
                  </p>
                </div>
              </div>
            )}

            {!notificationsLoading && !notificationsError && !notifications.length && (
              <div className="admin-notification-item">
                <div className="admin-notification-content">
                  <p className="admin-notification-text">No notifications yet.</p>
                </div>
              </div>
            )}

            {!notificationsLoading && !notificationsError && notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`admin-notification-item ${notification.is_read ? "admin-notification-item--read" : "admin-notification-item--unread"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.is_read && <div className="admin-notification-dot" />}
                <div className="admin-notification-content">
                  <p className="admin-notification-text">
                    <strong>{notification.title}</strong> {notification.body}
                  </p>
                  <span className="admin-notification-time">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}