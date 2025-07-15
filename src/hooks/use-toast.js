import { useState, useCallback } from "react";

/**
 * Toast hook for displaying notifications
 * @returns {Object} Toast functions and state
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      title: toast.title || '',
      description: toast.description || '',
      variant: toast.variant || 'default',
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
}

/**
 * Simple toast function for quick notifications
 * @param {Object} options - Toast options
 * @param {string} options.title - Toast title
 * @param {string} options.description - Toast description
 * @param {string} options.variant - Toast variant (default, destructive, success)
 * @param {number} options.duration - Toast duration in ms
 */
export const toast = (options) => {
  // For now, we'll use console logging as a fallback
  // In a real app, you'd want to use a global toast context
  const variant = options.variant || 'default';
  const title = options.title || '';
  const description = options.description || '';
  
  const message = title ? `${title}: ${description}` : description;
  
  switch (variant) {
    case 'destructive':
      console.error(`🚨 ${message}`);
      break;
    case 'success':
      console.log(`✅ ${message}`);
      break;
    default:
      console.info(`ℹ️ ${message}`);
  }
  
  // Show browser notification if available
  if (typeof window !== 'undefined' && window.Notification) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: description,
        icon: '/favicon.ico',
      });
    }
  }
};
