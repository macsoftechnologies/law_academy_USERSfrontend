import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotificationsList, markNotificationRead as apiMarkNotificationRead } from '../api/notifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
    const userId = localStorage.getItem('userId') || user?._id || user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await getNotificationsList(userId);
      if (res?.data?.items) {
        setNotifications(res.data.items);
        const unread = res.data.items.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
    const userId = localStorage.getItem('userId') || user?._id || user?.id;
    if (!userId) return;

    try {
      await apiMarkNotificationRead(userId, notificationId);
      // Optimistically update
      setNotifications(prev => {
        const next = prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n);
        setUnreadCount(next.filter(n => !n.isRead).length);
        return next;
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
      const userId = localStorage.getItem('userId') || user?._id || user?.id;
      if (userId) fetchNotifications();
    }, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
