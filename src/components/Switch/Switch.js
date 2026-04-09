import React from 'react';
import './Switch.css';

/**
 * Custom Switch Component
 *
 * @param {Boolean}  checked      - Controlled checked state
 * @param {Function} onChange     - Change handler — receives (checked: boolean)
 * @param {String}   label        - Label text displayed beside the switch
 * @param {String}   labelPosition- 'left' | 'right' (default: 'right')
 * @param {String}   size         - 'small' | 'medium' | 'large' (default: 'medium')
 * @param {String}   variant      - 'primary' | 'success' | 'danger' | 'warning' (default: 'primary')
 * @param {Boolean}  disabled     - Disable the switch (default: false)
 * @param {Boolean}  required     - Mark label as required (default: false)
 * @param {String}   error        - Error message shown below the switch
 * @param {String}   helperText   - Helper text shown below (when no error)
 * @param {String}   onLabel      - Text inside track when on  (optional)
 * @param {String}   offLabel     - Text inside track when off (optional)
 * @param {String}   id           - HTML id (auto-generated if omitted)
 * @param {String}   className    - Additional CSS classes on the wrapper
 */
function Switch({
  checked = false,
  onChange,
  label = '',
  labelPosition = 'right',
  size = 'medium',
  variant = 'primary',
  disabled = false,
  required = false,
  error = '',
  helperText = '',
  onLabel = '',
  offLabel = '',
  id,
  className = '',
  ...props
}) {
  const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

  const handleChange = (e) => {
    if (disabled) return;
    if (onChange) onChange(e.target.checked);
  };

  const wrapperClasses = [
    'custom-switch-wrapper',
    className,
  ].filter(Boolean).join(' ');

  const trackClasses = [
    'custom-switch-track',
    `custom-switch-track-${size}`,
    `custom-switch-track-${variant}`,
    checked && 'custom-switch-track-checked',
    disabled && 'custom-switch-track-disabled',
    error && 'custom-switch-track-error',
  ].filter(Boolean).join(' ');

  const labelEl = label && (
    <label
      htmlFor={switchId}
      className={[
        'custom-switch-label',
        `custom-switch-label-${size}`,
        disabled && 'custom-switch-label-disabled',
      ].filter(Boolean).join(' ')}
    >
      {label}
      {required && <span className="custom-switch-required">*</span>}
    </label>
  );

  return (
    <div className={wrapperClasses}>
      <div className="custom-switch-control">
        {labelPosition === 'left' && labelEl}

        <div className="custom-switch-input-wrapper">
          <input
            type="checkbox"
            id={switchId}
            className="custom-switch-input"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            {...props}
          />
          <div
            className={trackClasses}
            onClick={() => !disabled && onChange && onChange(!checked)}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
          >
            {(onLabel || offLabel) && (
              <span className="custom-switch-track-label">
                {checked ? onLabel : offLabel}
              </span>
            )}
            <span className={[
              'custom-switch-thumb',
              `custom-switch-thumb-${size}`,
              checked && 'custom-switch-thumb-checked',
            ].filter(Boolean).join(' ')} />
          </div>
        </div>

        {labelPosition === 'right' && labelEl}
      </div>

      {error && (
        <span className="custom-switch-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="custom-switch-helper-text">{helperText}</span>
      )}
    </div>
  );
}

export default Switch;
