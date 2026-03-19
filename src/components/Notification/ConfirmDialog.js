import React from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../Button/Button';
import './ConfirmDialog.css';

/**
 * Confirm Dialog Component
 * 
 * @param {Boolean} isOpen - Whether dialog is open
 * @param {String} type - Dialog type: 'confirm', 'warning', 'danger', 'info'
 * @param {String} title - Dialog title
 * @param {String} message - Dialog message
 * @param {String} confirmText - Confirm button text
 * @param {String} cancelText - Cancel button text
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @param {ReactNode} icon - Custom icon
 */
function ConfirmDialog({
  isOpen,
  type = 'confirm',
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon,
}) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const getDefaultIcon = () => {
    if (icon !== undefined) return icon;

    switch (type) {
      case 'danger':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'info':
        return <FiInfo />;
      case 'confirm':
      default:
        return <FiCheckCircle />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const dialogClasses = [
    'confirm-dialog-overlay',
    isDark && 'confirm-dialog-dark',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div className={dialogClasses}>
      <div className={`confirm-dialog confirm-dialog-${type}`}>
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon-wrapper">
            <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
              {getDefaultIcon()}
            </div>
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
          <button
            className="confirm-dialog-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <Button
            variant="secondary"
            onClick={handleCancel}
            size="small"
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}
            onClick={handleConfirm}
            size="small"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
