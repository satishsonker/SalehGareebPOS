/**
 * Button Component Usage Examples
 * 
 * This file demonstrates how to use the custom Button component
 */

import React, { useState } from 'react';
import { FiSave, FiTrash2, FiEdit, FiPlus, FiDownload, FiRefreshCw, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import Button from './Button';

// Example 1: Basic Buttons with Different Variants
export function ButtonVariantsExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}

// Example 2: Buttons with Icons
export function ButtonWithIconsExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" icon={<FiSave />}>
        Save
      </Button>
      <Button variant="danger" icon={<FiTrash2 />}>
        Delete
      </Button>
      <Button variant="success" icon={<FiCheck />} iconPosition="right">
        Confirm
      </Button>
      <Button variant="info" icon={<FiDownload />}>
        Download
      </Button>
    </div>
  );
}

// Example 3: Icon Only Buttons
export function IconOnlyButtonsExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" icon={<FiPlus />} aria-label="Add" />
      <Button variant="secondary" icon={<FiEdit />} aria-label="Edit" />
      <Button variant="danger" icon={<FiTrash2 />} aria-label="Delete" />
      <Button variant="ghost" icon={<FiRefreshCw />} aria-label="Refresh" />
    </div>
  );
}

// Example 4: Different Sizes
export function ButtonSizesExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" size="small" icon={<FiSave />}>
        Small
      </Button>
      <Button variant="primary" size="medium" icon={<FiSave />}>
        Medium
      </Button>
      <Button variant="primary" size="large" icon={<FiSave />}>
        Large
      </Button>
    </div>
  );
}

// Example 5: Loading State
export function ButtonLoadingExample() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert('Action completed!');
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" loading={loading} onClick={handleClick} icon={<FiSave />}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
      <Button variant="success" loading={loading} onClick={handleClick} icon={<FiCheck />}>
        Submit
      </Button>
    </div>
  );
}

// Example 6: Disabled State
export function ButtonDisabledExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" disabled icon={<FiSave />}>
        Disabled Primary
      </Button>
      <Button variant="danger" disabled icon={<FiTrash2 />}>
        Disabled Danger
      </Button>
      <Button variant="ghost" disabled icon={<FiEdit />}>
        Disabled Ghost
      </Button>
    </div>
  );
}

// Example 7: Full Width Button
export function FullWidthButtonExample() {
  return (
    <div style={{ width: '300px' }}>
      <Button variant="primary" fullWidth icon={<FiSave />}>
        Full Width Button
      </Button>
    </div>
  );
}

// Example 8: Button Group (Toolbar Style)
export function ButtonGroupExample() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem' }}>
        <Button variant="ghost" icon={<FiRefreshCw />} aria-label="Refresh" />
        <Button variant="ghost" icon={<FiDownload />} aria-label="Export" />
        <Button variant="ghost" icon={<FiAlertCircle />} aria-label="Filter" />
      </div>
      <Button variant="primary" icon={<FiPlus />}>
        Add New
      </Button>
    </div>
  );
}

// Example 9: Real-world Usage (Form Actions)
export function FormActionsExample() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    alert('Saved successfully!');
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={() => alert('Cancelled')}>
        Cancel
      </Button>
      <Button variant="primary" loading={saving} onClick={handleSave} icon={<FiSave />}>
        Save Changes
      </Button>
    </div>
  );
}

// Example 10: Conditional Rendering
export function ConditionalButtonExample() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {isAdmin && (
          <Button variant="danger" icon={<FiTrash2 />}>
            Delete
          </Button>
        )}
        {!isBlocked && (
          <Button variant="warning" icon={<FiAlertCircle />}>
            Block User
          </Button>
        )}
        {isBlocked && (
          <Button variant="success" icon={<FiCheck />}>
            Unblock User
          </Button>
        )}
      </div>
      <div>
        <Button variant="secondary" size="small" onClick={() => setIsAdmin(!isAdmin)}>
          Toggle Admin
        </Button>
        <Button variant="secondary" size="small" onClick={() => setIsBlocked(!isBlocked)}>
          Toggle Blocked
        </Button>
      </div>
    </div>
  );
}
