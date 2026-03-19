import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

const NotificationContext = createContext(null);

let toastIdCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Show toast notification
  const showToast = useCallback((options) => {
    const id = `toast-${++toastIdCounter}`;
    const toast = {
      id,
      type: options.type || 'info',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : 5000,
      icon: options.icon,
    };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Show success toast
  const success = useCallback((message, duration) => {
    return showToast({ type: 'success', message, duration });
  }, [showToast]);

  // Show error toast
  const error = useCallback((message, duration) => {
    return showToast({ type: 'error', message, duration });
  }, [showToast]);

  // Show warning toast
  const warning = useCallback((message, duration) => {
    return showToast({ type: 'warning', message, duration });
  }, [showToast]);

  // Show info toast
  const info = useCallback((message, duration) => {
    return showToast({ type: 'info', message, duration });
  }, [showToast]);

  // Show confirm dialog
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    confirm,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          {...confirmDialog}
        />
      )}
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
