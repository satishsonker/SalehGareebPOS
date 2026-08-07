import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/api/notificationApi';

const NotificationContext = createContext(null);

let toastIdCounter = 0;

const POLL_INTERVAL_MS = 60_000;

// Extract the flat list from ApiResponse<PagingResponseDto<T>>
// Shape: { success, data: { data: [], totalRecords, pageNo, pageSize } }
function extractPagedList(res) {
  if (res?.success && res?.data) {
    return res.data?.data ?? [];
  }
  return [];
}

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // API-backed notification inbox
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const pollRef = useRef(null);

  // ── API helpers ────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) return;
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await getUserNotifications(user.userId);
      setNotifications(extractPagedList(res));
    } catch (err) {
      setNotifError(err.message || 'Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  }, [user?.userId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.userId) return;
    try {
      // Response shape: { success: true, data: <number> }
      const res = await getUnreadCount(user.userId);
      if (res?.success) {
        setUnreadCount(typeof res.data === 'number' ? res.data : 0);
      }
    } catch {
      // silent — badge stays as-is
    }
  }, [user?.userId]);

  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // revert on failure
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.userId) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(user.userId);
    } catch {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.userId, fetchNotifications, fetchUnreadCount]);

  const removeNotification = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
    try {
      await deleteNotification(id);
    } catch {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const clearInbox = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ── Fetch + polling on auth change ────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setNotifications([]);
      setUnreadCount(0);
      clearInterval(pollRef.current);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, user?.userId, fetchNotifications, fetchUnreadCount]);

  // ── Toast helpers ──────────────────────────────────────────

  const showToast = useCallback((options) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: options.type || 'info',
        message: options.message || '',
        duration: options.duration !== undefined ? options.duration : 5000,
        icon: options.icon,
      },
    ]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, duration) =>
    showToast({ type: 'success', message, duration }), [showToast]);

  const error = useCallback((message, duration) =>
    showToast({ type: 'error', message, duration }), [showToast]);

  const warning = useCallback((message, duration) =>
    showToast({ type: 'warning', message, duration }), [showToast]);

  const info = useCallback((message, duration) =>
    showToast({ type: 'info', message, duration }), [showToast]);

  const clearAll = useCallback(() => setToasts([]), []);

  // ── Confirm dialog ─────────────────────────────────────────

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => { setConfirmDialog(null); resolve(true); },
        onCancel:  () => { setConfirmDialog(null); resolve(false); },
      });
    });
  }, []);

  const value = {
    showToast, removeToast, clearAll,
    success, error, warning, info,
    confirm,
    notifications,
    unreadCount,
    notifLoading,
    notifError,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearInbox,
  };

  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {isMounted && portalRoot
        ? createPortal(
            <div className="toast-container" role="region" aria-live="polite" aria-atomic="false">
              {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={removeToast} />
              ))}
            </div>,
            portalRoot
          )
        : null}
      {confirmDialog && isMounted && portalRoot
        ? createPortal(<ConfirmDialog isOpen={true} {...confirmDialog} />, portalRoot)
        : null}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
