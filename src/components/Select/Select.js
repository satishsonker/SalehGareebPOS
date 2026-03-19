import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './Select.css';

/**
 * Multipurpose Select/Dropdown Component
 * 
 * A fully customizable dropdown component for selecting from a list of options.
 * 
 * @param {Array} options - Array of options: [{ value, label, icon, disabled, ... }]
 * @param {String|Number} value - Selected value
 * @param {Function} onChange - Callback when option is selected: (option) => void
 * @param {String} placeholder - Placeholder text
 * @param {String} size - Dropdown size: 'small', 'medium', 'large' (default: 'small')
 * @param {Boolean} showSearch - Show search input (default: false)
 * @param {Function} searchFilter - Custom search filter function: (option, searchTerm) => boolean
 * @param {String} searchPlaceholder - Search input placeholder
 * @param {Boolean} multiple - Allow multiple selections (default: false)
 * @param {Boolean} disabled - Disable dropdown (default: false)
 * @param {Boolean} required - Mark as required (default: false)
 * @param {String} error - Error message to display
 * @param {String} label - Label text
 * @param {String} helperText - Helper text below dropdown
 * @param {String} className - Additional CSS classes
 * @param {Object} style - Custom inline styles
 * @param {Function} renderOption - Custom render function for options: (option) => ReactNode
 * @param {Function} renderValue - Custom render function for selected value: (option) => ReactNode
 * @param {Boolean} clearable - Show clear button (default: true)
 * @param {String} emptyMessage - Message when no options available
 * @param {String} noResultsMessage - Message when search returns no results
 * @param {Number} maxHeight - Maximum height of dropdown list in pixels (default: 300)
 */
function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  size = 'small',
  showSearch = false,
  searchFilter,
  searchPlaceholder = 'Search...',
  multiple = false,
  disabled = false,
  required = false,
  error = '',
  label = '',
  helperText = '',
  className = '',
  style = {},
  renderOption,
  renderValue,
  clearable = true,
  emptyMessage = 'No options available',
  noResultsMessage = 'No results found',
  maxHeight = 300,
  ...props
}) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get selected option(s)
  const getSelectedOptions = () => {
    if (multiple) {
      if (!Array.isArray(value)) return [];
      return options.filter(opt => value.includes(opt.value));
    } else {
      return options.find(opt => opt.value === value) || null;
    }
  };

  const selectedOptions = getSelectedOptions();

  // Filter options based on search
  const getFilteredOptions = () => {
    let filtered = options;

    if (searchTerm && showSearch) {
      const term = searchTerm.toLowerCase();
      if (searchFilter) {
        filtered = filtered.filter(opt => searchFilter(opt, searchTerm));
      } else {
        filtered = filtered.filter(opt => {
          const label = opt.label || opt.value?.toString() || '';
          const value = opt.value?.toString() || '';
          return (
            label.toLowerCase().includes(term) ||
            value.toLowerCase().includes(term)
          );
        });
      }
    }

    return filtered;
  };

  const filteredOptions = getFilteredOptions();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current && showSearch) {
          searchInputRef.current.focus();
        }
      }, 100);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, showSearch]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);
      let newValues;
      
      if (isSelected) {
        newValues = currentValues.filter(v => v !== option.value);
      } else {
        newValues = [...currentValues, option.value];
      }
      
      if (onChange) {
        onChange(newValues, options.filter(opt => newValues.includes(opt.value)));
      }
    } else {
      if (onChange) {
        onChange(option.value, option);
      }
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (multiple) {
      if (onChange) {
        onChange([], []);
      }
    } else {
      if (onChange) {
        onChange(null, null);
      }
    }
    setSearchTerm('');
  };

  const isSelected = (option) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option.value);
    } else {
      return value === option.value;
    }
  };

  // Default render functions
  const defaultRenderValue = (selected) => {
    if (multiple) {
      if (selected.length === 0) {
        return <span className="custom-select-placeholder">{placeholder}</span>;
      }
      if (selected.length === 1) {
        const opt = selected[0];
        return (
          <div className="custom-select-value">
            {opt.icon && <span className="custom-select-icon">{opt.icon}</span>}
            <span className="custom-select-label">{opt.label || opt.value}</span>
          </div>
        );
      }
      return (
        <span className="custom-select-value">
          {selected.length} selected
        </span>
      );
    } else {
      if (!selected) {
        return <span className="custom-select-placeholder">{placeholder}</span>;
      }
      return (
        <div className="custom-select-value">
          {selected.icon && <span className="custom-select-icon">{selected.icon}</span>}
          <span className="custom-select-label">{selected.label || selected.value}</span>
        </div>
      );
    }
  };

  const defaultRenderOption = (option) => {
    const selected = isSelected(option);
    return (
      <>
        {option.icon && (
          <span className="custom-select-option-icon">{option.icon}</span>
        )}
        <span className="custom-select-option-label">{option.label || option.value}</span>
        {selected && (
          <span className="custom-select-option-check">
            <FiCheck />
          </span>
        )}
      </>
    );
  };

  const dropdownClasses = [
    'custom-select',
    `custom-select-${size}`,
    isOpen && 'custom-select-open',
    error && 'custom-select-error',
    disabled && 'custom-select-disabled',
    multiple && 'custom-select-multiple',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="custom-select-wrapper" ref={containerRef}>
      {label && (
        <label className="custom-select-label">
          {label}
          {required && <span className="custom-select-required">*</span>}
        </label>
      )}
      <div className={dropdownClasses} style={style}>
        <div
          className="custom-select-trigger"
          onClick={handleToggle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          {renderValue
            ? renderValue(selectedOptions)
            : defaultRenderValue(selectedOptions)
          }
          <div className="custom-select-actions">
            {clearable && selectedOptions && 
             ((multiple && selectedOptions.length > 0) || (!multiple && selectedOptions)) &&
             !disabled && (
              <span
                className="custom-select-clear"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <FiX />
              </span>
            )}
            <span className="custom-select-arrow">
              <FiChevronDown />
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="custom-select-dropdown" style={{ maxHeight: `${maxHeight}px` }}>
            {showSearch && (
              <div className="custom-select-search">
                <FiSearch className="custom-select-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="custom-select-search-input"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    className="custom-select-search-clear"
                    onClick={() => setSearchTerm('')}
                    type="button"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}

            <div className="custom-select-list" style={{ maxHeight: `${maxHeight - (showSearch ? 60 : 0)}px` }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const selected = isSelected(option);
                  return (
                    <div
                      key={option.value ?? index}
                      className={`custom-select-option ${
                        selected ? 'custom-select-option-selected' : ''
                      } ${option.disabled ? 'custom-select-option-disabled' : ''}`}
                      onClick={() => handleSelect(option)}
                      role="option"
                      aria-selected={selected}
                    >
                      {renderOption
                        ? renderOption(option, selected)
                        : defaultRenderOption(option)
                      }
                    </div>
                  );
                })
              ) : (
                <div className="custom-select-no-results">
                  {searchTerm ? noResultsMessage : emptyMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <span className="custom-select-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="custom-select-helper-text">{helperText}</span>
      )}
    </div>
  );
}

export default Select;
