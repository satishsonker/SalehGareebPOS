/**
 * Modal Component Usage Examples
 * 
 * This file demonstrates how to use the fully customizable Modal component
 */

import React, { useState } from 'react';
import { FiSave, FiX, FiTrash2, FiCheck } from 'react-icons/fi';
import Modal from './Modal';

// Example 1: Basic Modal
export function BasicModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Basic Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Basic Modal"
        size="medium"
      >
        <p>This is a basic modal with default settings.</p>
      </Modal>
    </>
  );
}

// Example 2: Modal with Type (Info, Success, Warning, Error)
export function TypedModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('info');

  return (
    <>
      <div>
        <button onClick={() => { setType('info'); setIsOpen(true); }}>Info Modal</button>
        <button onClick={() => { setType('success'); setIsOpen(true); }}>Success Modal</button>
        <button onClick={() => { setType('warning'); setIsOpen(true); }}>Warning Modal</button>
        <button onClick={() => { setType('error'); setIsOpen(true); }}>Error Modal</button>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${type.charAt(0).toUpperCase() + type.slice(1)} Modal`}
        type={type}
        size="medium"
      >
        <p>This is a {type} type modal with appropriate icon and styling.</p>
      </Modal>
    </>
  );
}

// Example 3: Modal with Custom Actions
export function ModalWithActionsExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal with Actions</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        type="warning"
        size="small"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Delete',
            onClick: () => {
              alert('Item deleted!');
              setIsOpen(false);
            },
            variant: 'danger',
            icon: FiTrash2,
          },
        ]}
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
    </>
  );
}

// Example 4: Modal with Custom Footer
export function ModalWithCustomFooterExample() {
  const [isOpen, setIsOpen] = useState(false);

  const customFooter = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        * Required fields
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setIsOpen(false)}>Cancel</button>
        <button onClick={() => setIsOpen(false)} style={{ background: 'var(--accent-color)', color: 'white' }}>
          Save
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal with Custom Footer</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Custom Footer Modal"
        size="medium"
        footer={customFooter}
      >
        <p>This modal has a custom footer instead of default action buttons.</p>
      </Modal>
    </>
  );
}

// Example 5: Modal with Loading State
export function ModalWithLoadingExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setIsOpen(false);
    alert('Saved successfully!');
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Loading Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => !loading && setIsOpen(false)}
        title="Save Data"
        size="medium"
        loading={loading}
        closeOnOverlayClick={!loading}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            variant: 'secondary',
            disabled: loading,
          },
          {
            label: 'Save',
            onClick: handleSave,
            variant: 'primary',
            icon: FiSave,
            disabled: loading,
          },
        ]}
      >
        <p>Click Save to see the loading state. The modal cannot be closed while loading.</p>
      </Modal>
    </>
  );
}

// Example 6: Different Sizes
export function ModalSizesExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState('medium');

  return (
    <>
      <div>
        <button onClick={() => { setSize('small'); setIsOpen(true); }}>Small</button>
        <button onClick={() => { setSize('medium'); setIsOpen(true); }}>Medium</button>
        <button onClick={() => { setSize('large'); setIsOpen(true); }}>Large</button>
        <button onClick={() => { setSize('xlarge'); setIsOpen(true); }}>XLarge</button>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${size.charAt(0).toUpperCase() + size.slice(1)} Modal`}
        size={size}
      >
        <p>This is a {size} sized modal.</p>
      </Modal>
    </>
  );
}

// Example 7: Modal without Close Button
export function ModalWithoutCloseExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal without Close Button</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="No Close Button"
        size="small"
        showCloseButton={false}
        closeOnOverlayClick={false}
        actions={[
          {
            label: 'OK',
            onClick: () => setIsOpen(false),
            variant: 'primary',
          },
        ]}
      >
        <p>This modal doesn't have a close button. You must click OK to close it.</p>
      </Modal>
    </>
  );
}

// Example 8: Modal with Custom Icon
export function ModalWithCustomIconExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal with Custom Icon</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Custom Icon Modal"
        size="medium"
        icon={<FiCheck style={{ color: 'green' }} />}
      >
        <p>This modal has a custom icon instead of the default type icon.</p>
      </Modal>
    </>
  );
}
