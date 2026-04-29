import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiDelete, FiCheck, FiX } from 'react-icons/fi';
import './NumericKeypad.css';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'DEL'],
];

/**
 * NumericKeypad  — centered modal with overlay
 * Props:
 *   isOpen      boolean
 *   value       string
 *   onChange    (val: string) => void
 *   onConfirm   (val: string) => void
 *   onClose     () => void
 *   label       string   — header label
 *   maxLength   number   — default 10
 */
function NumericKeypad({ isOpen, value = '', onChange, onConfirm, onClose, label = 'Enter Amount', maxLength = 10 }) {

  // Physical keyboard passthrough
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === '.') press('.');
      else if (e.key === 'Backspace') press('DEL');
      else if (e.key === 'Enter') handleConfirm();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, value]);

  const press = (key) => {
    if (key === 'DEL') { onChange(value.slice(0, -1)); return; }
    if (key === '.' && value.includes('.')) return;
    if (value.replace('.', '').length >= maxLength) return;
    onChange(value + key);
  };

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };

  if (!isOpen) return null;

  const display = value || '0';

  return createPortal(
    <div className="nkp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="nkp-modal">
        {/* Header */}
        <div className="nkp-header">
          <span className="nkp-label">{label}</span>
          <button className="nkp-close" onClick={onClose}><FiX size={17} /></button>
        </div>

        {/* Display */}
        <div className="nkp-display">
          <span className="nkp-display__val">{display}</span>
          {value && (
            <button className="nkp-clear" onClick={() => onChange('')}>Clear</button>
          )}
        </div>

        {/* Key grid */}
        <div className="nkp-grid">
          {ROWS.map((row, ri) =>
            row.map(key => (
              <button
                key={`${ri}-${key}`}
                className={`nkp-key ${key === 'DEL' ? 'nkp-key--del' : ''} ${key === '.' ? 'nkp-key--dot' : ''}`}
                onClick={() => press(key)}
              >
                {key === 'DEL' ? <FiDelete size={20} /> : key}
              </button>
            ))
          )}
        </div>

        {/* Confirm */}
        <button className="nkp-confirm" onClick={handleConfirm}>
          <FiCheck size={17} /> Confirm
        </button>
      </div>
    </div>,
    document.body
  );
}

export default NumericKeypad;
