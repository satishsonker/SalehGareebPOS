/**
 * TextBox Component Usage Examples
 * 
 * This file demonstrates how to use the custom TextBox component
 */

import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiSearch, FiDollarSign, FiPhone, FiCalendar } from 'react-icons/fi';
import TextBox from './TextBox';

// Example 1: Basic TextBox
export function BasicTextBoxExample() {
  const [value, setValue] = useState('');

  return (
    <TextBox
      placeholder="Enter text..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Example 2: TextBox with Icons
export function TextBoxWithIconsExample() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextBox
        label="Username"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        leftIcon={<FiUser />}
      />
      <TextBox
        label="Email"
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<FiMail />}
      />
    </div>
  );
}

// Example 3: Numeric TextBox with Virtual Keyboard
export function NumericTextBoxExample() {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextBox
        label="Price"
        type="number"
        placeholder="Enter price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        leftIcon={<FiDollarSign />}
        showVirtualKeyboard={true}
        min={0}
        step={0.01}
      />
      <TextBox
        label="Quantity"
        type="number"
        placeholder="Enter quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        showVirtualKeyboard={true}
        min={0}
      />
    </div>
  );
}

// Example 4: TextBox with Validation
export function TextBoxWithValidationExample() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  return (
    <TextBox
      label="Email Address"
      type="email"
      placeholder="Enter email"
      value={email}
      onChange={handleChange}
      leftIcon={<FiMail />}
      error={error}
      required
    />
  );
}

// Example 5: Different Sizes
export function TextBoxSizesExample() {
  const [small, setSmall] = useState('');
  const [medium, setMedium] = useState('');
  const [large, setLarge] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextBox
        label="Small"
        size="small"
        value={small}
        onChange={(e) => setSmall(e.target.value)}
        placeholder="Small input"
      />
      <TextBox
        label="Medium"
        size="medium"
        value={medium}
        onChange={(e) => setMedium(e.target.value)}
        placeholder="Medium input"
      />
      <TextBox
        label="Large"
        size="large"
        value={large}
        onChange={(e) => setLarge(e.target.value)}
        placeholder="Large input"
      />
    </div>
  );
}

// Example 6: Disabled and ReadOnly
export function TextBoxStatesExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextBox
        label="Disabled Input"
        value="This is disabled"
        disabled
        leftIcon={<FiUser />}
      />
      <TextBox
        label="Read Only Input"
        value="This is read-only"
        readOnly
        leftIcon={<FiMail />}
      />
    </div>
  );
}

// Example 7: With Helper Text
export function TextBoxWithHelperTextExample() {
  const [password, setPassword] = useState('');

  return (
    <TextBox
      label="Password"
      type="password"
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      leftIcon={<FiLock />}
      helperText="Password must be at least 8 characters"
      required
    />
  );
}

// Example 8: Phone Number with Virtual Keyboard
export function PhoneTextBoxExample() {
  const [phone, setPhone] = useState('');

  return (
    <TextBox
      label="Phone Number"
      type="tel"
      placeholder="Enter phone number"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      leftIcon={<FiPhone />}
      showVirtualKeyboard={true}
      maxLength={15}
    />
  );
}

// Example 9: Search Box
export function SearchBoxExample() {
  const [search, setSearch] = useState('');

  return (
    <TextBox
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      leftIcon={<FiSearch />}
      rightIcon={search && (
        <button
          onClick={() => setSearch('')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ×
        </button>
      )}
    />
  );
}

// Example 10: Form with Multiple TextBoxes
export function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <TextBox
        label="Full Name"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange('name')}
        leftIcon={<FiUser />}
        required
      />
      <TextBox
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange('email')}
        leftIcon={<FiMail />}
        required
      />
      <TextBox
        label="Phone"
        type="tel"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={handleChange('phone')}
        leftIcon={<FiPhone />}
        showVirtualKeyboard={true}
      />
      <TextBox
        label="Amount"
        type="number"
        placeholder="Enter amount"
        value={formData.amount}
        onChange={handleChange('amount')}
        leftIcon={<FiDollarSign />}
        showVirtualKeyboard={true}
        min={0}
        step={0.01}
      />
    </form>
  );
}
