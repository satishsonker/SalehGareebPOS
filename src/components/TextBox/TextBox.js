import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import VirtualNumericKeyboard from './VirtualNumericKeyboard';
import './TextBox.css';

/**
 * Custom TextBox Component
 * 
 * A fully customizable text input component with icon support, virtual numeric keyboard, and theme compatibility.
 * 
 * @param {String} type - Input type: 'text', 'number', 'email', 'password', 'tel', etc. (default: 'text')
 * @param {String} size - Input size: 'small', 'medium', 'large' (default: 'small')
 * @param {ReactNode} leftIcon - Icon to display on the left side
 * @param {ReactNode} rightIcon - Icon to display on the right side
 * @param {Boolean} showVirtualKeyboard - Show virtual numeric keyboard for number inputs (default: true for type='number')
 * @param {String} placeholder - Placeholder text
 * @param {String} value - Input value (controlled)
 * @param {Function} onChange - Change handler
 * @param {Function} onFocus - Focus handler
 * @param {Function} onBlur - Blur handler
 * @param {Boolean} disabled - Disable input (default: false)
 * @param {Boolean} readOnly - Make input read-only (default: false)
 * @param {Boolean} required - Mark as required (default: false)
 * @param {String} error - Error message to display
 * @param {String} label - Label text
 * @param {String} helperText - Helper text below input
 * @param {String} className - Additional CSS classes
 * @param {Object} style - Custom inline styles
 * @param {Number} min - Minimum value (for number type)
 * @param {Number} max - Maximum value (for number type)
 * @param {Number} step - Step value (for number type)
 * @param {Number} maxLength - Maximum length
 * @param {String} pattern - Pattern for validation
 * @param {Boolean} autoFocus - Auto focus on mount
 */
function TextBox({
  type = 'text',
  size = 'small',
  leftIcon,
  rightIcon,
  showVirtualKeyboard,
  placeholder = '',
  value = '',
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  readOnly = false,
  required = false,
  error = '',
  label = '',
  helperText = '',
  className = '',
  style = {},
  min,
  max,
  step,
  maxLength,
  pattern,
  autoFocus = false,
  ...props
}) {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Determine if virtual keyboard should be shown
  const shouldShowKeyboard = showVirtualKeyboard !== undefined 
    ? showVirtualKeyboard 
    : (type === 'number' || type === 'tel');

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (shouldShowKeyboard && !disabled && !readOnly) {
      setShowKeyboard(true);
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    // Delay hiding keyboard to allow clicks on keyboard buttons
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowKeyboard(false);
      }
    }, 200);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle keyboard input
  const handleKeyboardInput = (input) => {
    if (disabled || readOnly) return;

    let newValue = value.toString();

    if (input === 'backspace') {
      newValue = newValue.slice(0, -1);
    } else if (input === 'clear') {
      newValue = '';
    } else if (input === '.') {
      if (!newValue.includes('.')) {
        newValue += '.';
      }
    } else if (input === '-') {
      if (newValue.startsWith('-')) {
        newValue = newValue.slice(1);
      } else {
        newValue = '-' + newValue;
      }
    } else {
      newValue += input;
    }

    // Validate number constraints
    if (type === 'number') {
      const numValue = parseFloat(newValue);
      if (newValue !== '' && newValue !== '-' && newValue !== '.') {
        if (min !== undefined && numValue < min) {
          newValue = min.toString();
        }
        if (max !== undefined && numValue > max) {
          newValue = max.toString();
        }
      }
    }

    // Apply maxLength constraint
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    if (onChange) {
      const syntheticEvent = {
        target: { value: newValue, name: props.name },
        currentTarget: { value: newValue, name: props.name },
      };
      onChange(syntheticEvent);
    }
  };

  // Close keyboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowKeyboard(false);
      }
    };

    if (showKeyboard) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showKeyboard]);

  const inputClasses = [
    'custom-textbox',
    `custom-textbox-${size}`,
    isFocused && 'custom-textbox-focused',
    error && 'custom-textbox-error',
    disabled && 'custom-textbox-disabled',
    readOnly && 'custom-textbox-readonly',
    leftIcon && 'custom-textbox-with-left-icon',
    rightIcon && 'custom-textbox-with-right-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="custom-textbox-wrapper" ref={containerRef}>
      {label && (
        <label className="custom-textbox-label">
          {label}
          {required && <span className="custom-textbox-required">*</span>}
        </label>
      )}
      <div className="custom-textbox-container">
        {leftIcon && (
          <span className="custom-textbox-icon custom-textbox-icon-left">
            {leftIcon}
          </span>
        )}
        <input
          ref={inputRef}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          pattern={pattern}
          autoFocus={autoFocus}
          style={style}
          {...props}
        />
        {rightIcon && (
          <span className="custom-textbox-icon custom-textbox-icon-right">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span className="custom-textbox-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="custom-textbox-helper-text">{helperText}</span>
      )}
      {shouldShowKeyboard && showKeyboard && !disabled && !readOnly && (
        <VirtualNumericKeyboard
          onInput={handleKeyboardInput}
          onClose={() => setShowKeyboard(false)}
          allowDecimal={type === 'number'}
          allowNegative={min === undefined || min < 0}
        />
      )}
    </div>
  );
}

export default TextBox;
