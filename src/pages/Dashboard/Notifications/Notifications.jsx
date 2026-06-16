import React from 'react';
import { useNotification } from '../../../context/NotificationContext';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';
import './Notifications.css';

export default function Notifications() {
  const { notifications, loading, markAsRead } = useNotification();
  const error = null; // Removed local error state to match context simplicity

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
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
