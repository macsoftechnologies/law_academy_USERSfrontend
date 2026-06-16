import { useState, useCallback } from 'react';

/**
 * useToast — lightweight toast notification hook.
 *
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast('success', 'Item added to cart!');
 *   return <div>...<ToastContainer /></div>
 */
export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, msg, duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  const ToastContainer = () => (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '.6rem',
      pointerEvents: 'none',
      minWidth: '280px',
      maxWidth: '360px',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          style={{ pointerEvents: 'auto', animation: 'fadeSlideIn .25s ease' }}
        >
          <span>{icons[t.type] || 'ℹ'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );

  return { toasts, showToast, ToastContainer };
}
