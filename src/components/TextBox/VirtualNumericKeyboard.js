import React from 'react';
import { FiX, FiDelete, FiMinus } from 'react-icons/fi';
import './VirtualNumericKeyboard.css';

/**
 * Virtual Numeric Keyboard Component
 * 
 * A customizable virtual numeric keyboard for numeric input fields.
 * 
 * @param {Function} onInput - Callback when a key is pressed
 * @param {Function} onClose - Callback to close the keyboard
 * @param {Boolean} allowDecimal - Allow decimal point (default: true)
 * @param {Boolean} allowNegative - Allow negative numbers (default: false)
 */
function VirtualNumericKeyboard({
  onInput,
  onClose,
  allowDecimal = true,
  allowNegative = false,
}) {
  const handleKeyPress = (key) => {
    if (onInput) {
      onInput(key);
    }
  };

  const numberKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="virtual-keyboard-overlay" onClick={onClose}>
      <div className="virtual-keyboard" onClick={(e) => e.stopPropagation()}>
        <div className="virtual-keyboard-header">
          <span className="virtual-keyboard-title">Numeric Keyboard</span>
          <button
            className="virtual-keyboard-close"
            onClick={onClose}
            aria-label="Close keyboard"
          >
            <FiX />
          </button>
        </div>
        <div className="virtual-keyboard-body">
          {/* Number pad */}
          <div className="virtual-keyboard-numbers">
            {numberKeys.map((row, rowIndex) => (
              <div key={rowIndex} className="virtual-keyboard-row">
                {row.map((num) => (
                  <button
                    key={num}
                    className="virtual-keyboard-key virtual-keyboard-key-number"
                    onClick={() => handleKeyPress(num)}
                    type="button"
                  >
                    {num}
                  </button>
                ))}
              </div>
            ))}
            {/* Bottom row: 0, decimal, negative */}
            <div className="virtual-keyboard-row">
              {allowNegative && (
                <button
                  className="virtual-keyboard-key virtual-keyboard-key-function"
                  onClick={() => handleKeyPress('-')}
                  type="button"
                  title="Toggle negative"
                >
                  <FiMinus />
                </button>
              )}
              <button
                className="virtual-keyboard-key virtual-keyboard-key-number virtual-keyboard-key-zero"
                onClick={() => handleKeyPress('0')}
                type="button"
              >
                0
              </button>
              {allowDecimal && (
                <button
                  className="virtual-keyboard-key virtual-keyboard-key-function"
                  onClick={() => handleKeyPress('.')}
                  type="button"
                >
                  .
                </button>
              )}
            </div>
          </div>
          {/* Function keys */}
          <div className="virtual-keyboard-functions">
            <button
              className="virtual-keyboard-key virtual-keyboard-key-function virtual-keyboard-key-clear"
              onClick={() => handleKeyPress('clear')}
              type="button"
            >
              Clear
            </button>
            <button
              className="virtual-keyboard-key virtual-keyboard-key-function virtual-keyboard-key-backspace"
              onClick={() => handleKeyPress('backspace')}
              type="button"
              title="Backspace"
            >
              <FiDelete />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualNumericKeyboard;
