import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './Toast.css';

/**
 * Toast Notification Component
 * 
 * @param {String} id - Unique identifier
 * @param {String} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {String} message - Message to display
 * @param {Number} duration - Auto-close duration in ms (0 = no auto-close)
 * @param {Function} onClose - Callback when toast is closed
 * @param {ReactNode} icon - Custom icon
 */
function Toast({ id, type = 'info', message = '', duration = 5000, onClose, icon }) {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close if duration is set
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (onClose) {
        onClose(id);
      }
    }, 300); // Wait for exit animation
  };

  const getDefaultIcon = () => {
    if (icon !== undefined) return icon;

    switch (type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'info':
      default:
        return <FiInfo />;
    }
  };

  const toastClasses = [
    'toast',
    `toast-${type}`,
    isVisible && !isLeaving && 'toast-visible',
    isLeaving && 'toast-leaving',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={toastClasses}>
      <div className="toast-icon">{getDefaultIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <FiX />
      </button>
    </div>
  );
}

export default Toast;
