import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { countries } from './countries';
import './CountrySelect.css';

/**
 * Custom Country Select Component
 * 
 * A fully customizable dropdown component for selecting countries with flags and ISD codes.
 * 
 * @param {String} size - Dropdown size: 'small', 'medium', 'large' (default: 'small')
 * @param {String} value - Selected country code (ISO 3166-1 alpha-2)
 * @param {Function} onChange - Callback when country is selected: (country) => void
 * @param {String} placeholder - Placeholder text
 * @param {Boolean} showFlag - Show country flag (default: true)
 * @param {Boolean} showISD - Show ISD code (default: true)
 * @param {Boolean} showSearch - Show search input (default: true)
 * @param {Boolean} disabled - Disable dropdown (default: false)
 * @param {Boolean} required - Mark as required (default: false)
 * @param {String} error - Error message to display
 * @param {String} label - Label text
 * @param {String} helperText - Helper text below dropdown
 * @param {String} className - Additional CSS classes
 * @param {Object} style - Custom inline styles
 * @param {Array} excludedCountries - Array of country codes to exclude
 * @param {Array} includedCountries - Array of country codes to include (if provided, only these will be shown)
 */
function CountrySelect({
  size = 'small',
  value = '',
  onChange,
  placeholder = 'Select country',
  showFlag = true,
  showISD = true,
  showSearch = true,
  disabled = false,
  required = false,
  error = '',
  label = '',
  helperText = '',
  className = '',
  style = {},
  excludedCountries = [],
  includedCountries = null,
  ...props
}) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter countries based on included/excluded lists
  const getFilteredCountries = () => {
    let filtered = countries;

    if (includedCountries && includedCountries.length > 0) {
      filtered = filtered.filter(country => includedCountries.includes(country.code));
    }

    if (excludedCountries.length > 0) {
      filtered = filtered.filter(country => !excludedCountries.includes(country.code));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(term) ||
        country.code.toLowerCase().includes(term) ||
        country.isd.replace('+', '').includes(term)
      );
    }

    return filtered;
  };

  const filteredCountries = getFilteredCountries();
  const selectedCountry = countries.find(c => c.code === value);

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

  const handleSelect = (country) => {
    if (onChange) {
      onChange(country);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange(null);
    }
    setSearchTerm('');
  };

  const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const dropdownClasses = [
    'custom-country-select',
    `custom-country-select-${size}`,
    isOpen && 'custom-country-select-open',
    error && 'custom-country-select-error',
    disabled && 'custom-country-select-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="custom-country-select-wrapper" ref={containerRef}>
      {label && (
        <label className="custom-country-select-label">
          {label}
          {required && <span className="custom-country-select-required">*</span>}
        </label>
      )}
      <div className={dropdownClasses} style={style}>
        <div
          className="custom-country-select-trigger"
          onClick={handleToggle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {selectedCountry ? (
            <div className="custom-country-select-value">
              {showFlag && (
                <span className="custom-country-select-flag">
                  {getFlagEmoji(selectedCountry.code)}
                </span>
              )}
              <span className="custom-country-select-name">{selectedCountry.name}</span>
              {showISD && (
                <span className="custom-country-select-isd">{selectedCountry.isd.startsWith('+') ? selectedCountry.isd : `+${selectedCountry.isd}`}</span>
              )}
            </div>
          ) : (
            <span className="custom-country-select-placeholder">{placeholder}</span>
          )}
          <div className="custom-country-select-actions">
            {selectedCountry && !disabled && (
              <span
                className="custom-country-select-clear"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <FiX />
              </span>
            )}
            <span className="custom-country-select-arrow">
              <FiChevronDown />
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="custom-country-select-dropdown">
            {showSearch && (
              <div className="custom-country-select-search">
                <FiSearch className="custom-country-select-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="custom-country-select-search-input"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    className="custom-country-select-search-clear"
                    onClick={() => setSearchTerm('')}
                    type="button"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}

            <div className="custom-country-select-list">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className={`custom-country-select-option ${
                      value === country.code ? 'custom-country-select-option-selected' : ''
                    }`}
                    onClick={() => handleSelect(country)}
                    role="option"
                    aria-selected={value === country.code}
                  >
                    {showFlag && (
                      <span className="custom-country-select-option-flag">
                        {getFlagEmoji(country.code)}
                      </span>
                    )}
                    <span className="custom-country-select-option-name">{country.name}</span>
                    {showISD && (
                      <span className="custom-country-select-option-isd">{country.isd.startsWith('+') ? country.isd : `+${country.isd}`}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="custom-country-select-no-results">No countries found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <span className="custom-country-select-error-message">{error}</span>
      )}
      {helperText && !error && (
        <span className="custom-country-select-helper-text">{helperText}</span>
      )}
    </div>
  );
}

export default CountrySelect;
