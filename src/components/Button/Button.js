import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './Button.css';

/**
 * Custom Button Component
 * 
 * A fully customizable button component with icon support, multiple variants, and theme compatibility.
 * 
 * @param {String} variant - Button style: 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'link'
 * @param {String} size - Button size: 'small', 'medium', 'large' (default: 'small')
 * @param {ReactNode} icon - Icon component to display (from react-icons)
 * @param {String} iconPosition - Icon position: 'left' or 'right' (default: 'left')
 * @param {Boolean} loading - Show loading spinner (default: false)
 * @param {Boolean} disabled - Disable button (default: false)
 * @param {Boolean} fullWidth - Make button full width (default: false)
 * @param {String} type - HTML button type: 'button', 'submit', 'reset' (default: 'button')
 * @param {Function} onClick - Click handler
 * @param {String} className - Additional CSS classes
 * @param {Object} style - Custom inline styles
 * @param {ReactNode} children - Button content/text
 */
function Button({
  variant = 'primary',
  size = 'small',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  children,
  ...props
}) {
  const { isDark } = useTheme();

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const buttonClasses = [
    'custom-button',
    `custom-button-${variant}`,
    `custom-button-${size}`,
    fullWidth && 'custom-button-full-width',
    loading && 'custom-button-loading',
    disabled && 'custom-button-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading && (
        <span className="custom-button-spinner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="custom-button-icon custom-button-icon-left">{icon}</span>
      )}
      {children && <span className="custom-button-text">{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="custom-button-icon custom-button-icon-right">{icon}</span>
      )}
    </button>
  );
}

export default Button;
