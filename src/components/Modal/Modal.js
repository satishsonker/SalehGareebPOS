import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../Button/Button';
import './Modal.css';

/**
 * Fully Customizable Modal Component
 * 
 * @param {Boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal is closed
 * @param {String} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {String} size - Modal size: 'small', 'medium', 'large', 'xlarge', 'fullscreen'
 * @param {String} type - Modal type: 'default', 'info', 'success', 'warning', 'error'
 * @param {ReactNode} icon - Custom header icon
 * @param {Boolean} showCloseButton - Show/hide close button (default: true)
 * @param {Boolean} closeOnOverlayClick - Close when clicking overlay (default: true)
 * @param {Boolean} closeOnEscape - Close on Escape key (default: true)
 * @param {ReactNode} footer - Custom footer content
 * @param {Array} actions - Array of action buttons: [{ label, onClick, variant, icon, disabled }]
 * @param {String} className - Additional CSS classes
 * @param {Object} style - Custom inline styles
 * @param {Boolean} loading - Show loading state
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  type = 'default',
  icon,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  actions = [],
  className = '',
  style = {},
  loading = false,
}) {
  const { isDark } = useTheme();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    
    setIsClosing(true);
    // Wait for animation to complete
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) {
        onClose();
      }
    }, 200);
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    if (icon !== undefined) return icon;
    
    switch (type) {
      case 'info':
        return <FiInfo />;
      case 'success':
        return <FiCheckCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'error':
        return <FiAlertCircle />;
      default:
        return null;
    }
  };

  const defaultIcon = getDefaultIcon();

  if (!isOpen && !isClosing) return null;

  return createPortal(
    <div 
      className={`modal-overlay ${isClosing ? 'modal-closing' : ''} ${isDark ? 'modal-dark' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        className={`modal-container modal-${size} modal-${type} ${className} ${isClosing ? 'modal-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        {/* Header */}
        {(title || defaultIcon || showCloseButton) && (
          <div className="modal-header">
            <div className="modal-header-left">
              {defaultIcon && (
                <div className={`modal-icon modal-icon-${type}`}>
                  {defaultIcon}
                </div>
              )}
              {title && <h2 className="modal-title">{title}</h2>}
            </div>
            {showCloseButton && (
              <button 
                className="modal-close-button"
                onClick={handleClose}
                aria-label="Close modal"
                disabled={loading}
              >
                <FiX />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {loading ? (
            <div className="modal-loading">
              <div className="modal-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {(footer || actions.length > 0) && (
          <div className="modal-footer">
            {footer || (
              <div className="modal-actions">
                {actions.map((action, index) => {
                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'secondary'}
                      icon={action.icon}
                      onClick={action.onClick}
                      disabled={action.disabled || loading}
                      loading={action.loading || false}
                      size="small"
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
