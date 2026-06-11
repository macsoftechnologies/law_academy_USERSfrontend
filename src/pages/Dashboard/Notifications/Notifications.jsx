import React, { useState, useEffect } from 'react';
import { getNotificationsList, markNotificationRead } from '../../../api/notifications';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return {};
    }
  })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    } else {
      setLoading(false);
      setError("User not authenticated.");
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsList(userId);
      if (res?.data?.items) {
        setNotifications(res.data.items);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(userId, notificationId);
      // Optimistically update the UI
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="dash-shell">
        <DashboardHeader />
        <div className="dash-main">
          <div className="dash-content">
            <div className="notifications-loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <div className="notifications-container">
            <h1 className="notifications-title">Notifications</h1>
            {error && <div className="notifications-error">{error}</div>}
            
            {notifications.length === 0 && !error ? (
              <div className="notifications-empty">You have no notifications.</div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`notification-card ${notif.isRead ? 'read' : 'unread'}`}
                    onClick={() => {
                      if (!notif.isRead) {
                        handleMarkAsRead(notif.notificationId);
                      }
                    }}
                  >
                    <div className="notification-icon">
                      {notif.type === 'announcement' ? '📢' : '🔔'}
                    </div>
                    <div className="notification-content">
                      <h3 className="notification-title">{notif.title}</h3>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {!notif.isRead && <div className="notification-unread-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
