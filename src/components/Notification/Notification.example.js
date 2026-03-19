/**
 * Notification Component Usage Examples
 * 
 * This file demonstrates how to use the custom Notification system
 */

import React from 'react';
import { FiCheck, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { useNotification } from './NotificationContext';
import Button from '../Button/Button';

// Example 1: Success Toast
export function SuccessToastExample() {
  const { success } = useNotification();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="success" onClick={() => success('Operation completed successfully!')}>
        Show Success
      </Button>
      <Button variant="success" onClick={() => success('User saved successfully!', 3000)}>
        Success (3s)
      </Button>
    </div>
  );
}

// Example 2: Error Toast
export function ErrorToastExample() {
  const { error } = useNotification();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="danger" onClick={() => error('An error occurred!')}>
        Show Error
      </Button>
      <Button variant="danger" onClick={() => error('Failed to save data. Please try again.', 0)}>
        Error (No Auto-close)
      </Button>
    </div>
  );
}

// Example 3: Warning Toast
export function WarningToastExample() {
  const { warning } = useNotification();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="warning" onClick={() => warning('This action may have consequences!')}>
        Show Warning
      </Button>
      <Button variant="warning" onClick={() => warning('Please review your changes before saving.', 7000)}>
        Warning (7s)
      </Button>
    </div>
  );
}

// Example 4: Info Toast
export function InfoToastExample() {
  const { info } = useNotification();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="info" onClick={() => info('New update available!')}>
        Show Info
      </Button>
      <Button variant="info" onClick={() => info('Your changes have been saved.', 4000)}>
        Info (4s)
      </Button>
    </div>
  );
}

// Example 5: Multiple Toasts
export function MultipleToastsExample() {
  const { success, error, warning, info } = useNotification();

  const showAll = () => {
    success('Success message');
    setTimeout(() => error('Error message'), 500);
    setTimeout(() => warning('Warning message'), 1000);
    setTimeout(() => info('Info message'), 1500);
  };

  return (
    <Button variant="primary" onClick={showAll}>
      Show All Toast Types
    </Button>
  );
}

// Example 6: Basic Confirm Dialog
export function BasicConfirmExample() {
  const { confirm, success } = useNotification();

  const handleClick = async () => {
    const result = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action?',
    });

    if (result) {
      success('Action confirmed!');
    }
  };

  return (
    <Button variant="primary" onClick={handleClick}>
      Show Confirm Dialog
    </Button>
  );
}

// Example 7: Danger Confirm Dialog
export function DangerConfirmExample() {
  const { confirm, success, error } = useNotification();

  const handleDelete = async () => {
    const result = await confirm({
      type: 'danger',
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (result) {
      success('Item deleted successfully');
    } else {
      error('Deletion cancelled');
    }
  };

  return (
    <Button variant="danger" onClick={handleDelete}>
      Delete Item
    </Button>
  );
}

// Example 8: Warning Confirm Dialog
export function WarningConfirmExample() {
  const { confirm, success } = useNotification();

  const handleAction = async () => {
    const result = await confirm({
      type: 'warning',
      title: 'Warning',
      message: 'This action will affect multiple records. Do you want to continue?',
      confirmText: 'Continue',
      cancelText: 'Cancel',
    });

    if (result) {
      success('Action completed');
    }
  };

  return (
    <Button variant="warning" onClick={handleAction}>
      Show Warning Confirm
    </Button>
  );
}

// Example 9: Info Confirm Dialog
export function InfoConfirmExample() {
  const { confirm, success } = useNotification();

  const handleInfo = async () => {
    const result = await confirm({
      type: 'info',
      title: 'Information',
      message: 'This feature requires additional permissions. Do you want to proceed?',
      confirmText: 'Proceed',
      cancelText: 'Cancel',
    });

    if (result) {
      success('Proceeding with action');
    }
  };

  return (
    <Button variant="info" onClick={handleInfo}>
      Show Info Confirm
    </Button>
  );
}

// Example 10: Real-world Usage
export function RealWorldExample() {
  const { confirm, success, error, warning } = useNotification();

  const handleSave = async () => {
    const result = await confirm({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
    });

    if (result) {
      // Simulate API call
      setTimeout(() => {
        success('Changes saved successfully!');
      }, 500);
    }
  };

  const handleDelete = async () => {
    const result = await confirm({
      type: 'danger',
      title: 'Delete Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (result) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        success('Record deleted successfully');
      } catch (err) {
        error('Failed to delete record');
      }
    }
  };

  const handleBulkAction = async () => {
    const result = await confirm({
      type: 'warning',
      title: 'Bulk Action',
      message: 'This will affect 50 records. Are you sure you want to continue?',
      confirmText: 'Continue',
      cancelText: 'Cancel',
    });

    if (result) {
      warning('Processing bulk action...');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete Record
      </Button>
      <Button variant="warning" onClick={handleBulkAction}>
        Bulk Action
      </Button>
    </div>
  );
}
