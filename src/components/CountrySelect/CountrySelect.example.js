/**
 * CountrySelect Component Usage Examples
 * 
 * This file demonstrates how to use the custom CountrySelect component
 */

import React, { useState } from 'react';
import CountrySelect from './CountrySelect';

// Example 1: Basic Country Select
export function BasicCountrySelectExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select a country"
    />
  );
}

// Example 2: Country Select with Label
export function CountrySelectWithLabelExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      label="Country"
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select your country"
      required
    />
  );
}

// Example 3: Country Select with ISD Code Only
export function CountrySelectISDOnlyExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      label="Phone Country Code"
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select country code"
      showFlag={false}
      showISD={true}
    />
  );
}

// Example 4: Country Select without Search
export function CountrySelectNoSearchExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      label="Country"
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select country"
      showSearch={false}
    />
  );
}

// Example 5: Different Sizes
export function CountrySelectSizesExample() {
  const [small, setSmall] = useState(null);
  const [medium, setMedium] = useState(null);
  const [large, setLarge] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <CountrySelect
        label="Small"
        size="small"
        value={small?.code || ''}
        onChange={(country) => setSmall(country)}
        placeholder="Select country"
      />
      <CountrySelect
        label="Medium"
        size="medium"
        value={medium?.code || ''}
        onChange={(country) => setMedium(country)}
        placeholder="Select country"
      />
      <CountrySelect
        label="Large"
        size="large"
        value={large?.code || ''}
        onChange={(country) => setLarge(country)}
        placeholder="Select country"
      />
    </div>
  );
}

// Example 6: With Validation
export function CountrySelectWithValidationExample() {
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (selectedCountry) => {
    setCountry(selectedCountry);
    if (!selectedCountry) {
      setError('Please select a country');
    } else {
      setError('');
    }
  };

  return (
    <CountrySelect
      label="Country"
      value={country?.code || ''}
      onChange={handleChange}
      placeholder="Select your country"
      error={error}
      required
    />
  );
}

// Example 7: Filtered Countries (Only Specific Countries)
export function CountrySelectFilteredExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      label="Select Country (Limited)"
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select country"
      includedCountries={['US', 'GB', 'CA', 'AU', 'DE', 'FR']}
    />
  );
}

// Example 8: Excluded Countries
export function CountrySelectExcludedExample() {
  const [country, setCountry] = useState(null);

  return (
    <CountrySelect
      label="Select Country"
      value={country?.code || ''}
      onChange={(selectedCountry) => setCountry(selectedCountry)}
      placeholder="Select country"
      excludedCountries={['KP', 'IR', 'SY']}
    />
  );
}

// Example 9: Phone Number Form with Country Select
export function PhoneNumberFormExample() {
  const [country, setCountry] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <CountrySelect
        label="Country"
        value={country?.code || ''}
        onChange={(selectedCountry) => setCountry(selectedCountry)}
        placeholder="Select country"
        required
      />
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          Phone Number
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {country && (
            <div style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
            }}>
              +{country.isd}
            </div>
          )}
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Example 10: Display Selected Country Info
export function CountrySelectDisplayExample() {
  const [country, setCountry] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <CountrySelect
        label="Select Country"
        value={country?.code || ''}
        onChange={(selectedCountry) => setCountry(selectedCountry)}
        placeholder="Select country"
      />
      {country && (
        <div style={{
          padding: '1rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Selected Country:</h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            <strong>Name:</strong> {country.name}<br />
            <strong>Code:</strong> {country.code}<br />
            <strong>ISD Code:</strong> +{country.isd}
          </p>
        </div>
      )}
    </div>
  );
}
