/**
 * Select Component Usage Examples
 * 
 * This file demonstrates how to use the multipurpose Select component
 */

import React, { useState } from 'react';
import { FiUser, FiMail, FiShield, FiSettings, FiStar, FiHeart } from 'react-icons/fi';
import Select from './Select';

// Example 1: Basic Select
export function BasicSelectExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Select an option"
    />
  );
}

// Example 2: Select with Icons
export function SelectWithIconsExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 'user', label: 'User', icon: <FiUser /> },
    { value: 'email', label: 'Email', icon: <FiMail /> },
    { value: 'admin', label: 'Admin', icon: <FiShield /> },
    { value: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Select an option"
    />
  );
}

// Example 3: Select with Search
export function SelectWithSearchExample() {
  const [value, setValue] = useState(null);

  const options = Array.from({ length: 50 }, (_, i) => ({
    value: `option${i + 1}`,
    label: `Option ${i + 1}`,
  }));

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Search and select..."
      showSearch={true}
    />
  );
}

// Example 4: Multiple Select
export function MultipleSelectExample() {
  const [value, setValue] = useState([]);

  const options = [
    { value: 'red', label: 'Red', icon: <FiHeart style={{ color: 'red' }} /> },
    { value: 'blue', label: 'Blue', icon: <FiStar style={{ color: 'blue' }} /> },
    { value: 'green', label: 'Green', icon: <FiStar style={{ color: 'green' }} /> },
    { value: 'yellow', label: 'Yellow', icon: <FiStar style={{ color: 'yellow' }} /> },
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Select multiple options"
      multiple={true}
    />
  );
}

// Example 5: Different Sizes
export function SelectSizesExample() {
  const [small, setSmall] = useState(null);
  const [medium, setMedium] = useState(null);
  const [large, setLarge] = useState(null);

  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Select
        label="Small"
        size="small"
        options={options}
        value={small}
        onChange={(val) => setSmall(val)}
      />
      <Select
        label="Medium"
        size="medium"
        options={options}
        value={medium}
        onChange={(val) => setMedium(val)}
      />
      <Select
        label="Large"
        size="large"
        options={options}
        value={large}
        onChange={(val) => setLarge(val)}
      />
    </div>
  );
}

// Example 6: With Validation
export function SelectWithValidationExample() {
  const [value, setValue] = useState(null);
  const [error, setError] = useState('');

  const options = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'guest', label: 'Guest' },
  ];

  const handleChange = (val) => {
    setValue(val);
    if (!val) {
      setError('Please select a role');
    } else {
      setError('');
    }
  };

  return (
    <Select
      label="User Role"
      options={options}
      value={value}
      onChange={handleChange}
      error={error}
      required
    />
  );
}

// Example 7: Custom Render Functions
export function CustomRenderExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 'premium', label: 'Premium Plan', price: '$99', icon: <FiStar /> },
    { value: 'basic', label: 'Basic Plan', price: '$29', icon: <FiUser /> },
    { value: 'enterprise', label: 'Enterprise Plan', price: '$299', icon: <FiShield /> },
  ];

  const renderOption = (option) => (
    <>
      {option.icon}
      <span style={{ flex: 1 }}>{option.label}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {option.price}
      </span>
    </>
  );

  const renderValue = (selected) => {
    if (!selected) return <span className="custom-select-placeholder">Select a plan</span>;
    return (
      <div className="custom-select-value">
        {selected.icon}
        <span>{selected.label}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {selected.price}
        </span>
      </div>
    );
  };

  return (
    <Select
      label="Select Plan"
      options={options}
      value={value}
      onChange={(val, opt) => setValue(val)}
      renderOption={renderOption}
      renderValue={renderValue}
    />
  );
}

// Example 8: With Disabled Options
export function SelectWithDisabledExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending', disabled: true },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Select status"
    />
  );
}

// Example 9: Small Width (Default)
export function SmallWidthExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
  ];

  return (
    <div style={{ width: '200px' }}>
      <Select
        options={options}
        value={value}
        onChange={(val) => setValue(val)}
        placeholder="Select size"
      />
    </div>
  );
}

// Example 10: Custom Search Filter
export function CustomSearchFilterExample() {
  const [value, setValue] = useState(null);

  const options = [
    { value: 'js', label: 'JavaScript', category: 'language' },
    { value: 'ts', label: 'TypeScript', category: 'language' },
    { value: 'react', label: 'React', category: 'framework' },
    { value: 'vue', label: 'Vue.js', category: 'framework' },
  ];

  const customFilter = (option, searchTerm) => {
    const term = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(term) ||
      option.category.toLowerCase().includes(term)
    );
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val)}
      placeholder="Search by name or category"
      showSearch={true}
      searchFilter={customFilter}
    />
  );
}
