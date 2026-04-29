import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FiPrinter } from 'react-icons/fi';
import './PrintButton.css';

/**
 * PrintButton — wraps any content ref with react-to-print.
 *
 * Usage A — provide your own contentRef:
 *   const ref = useRef(null);
 *   <div ref={ref}>...</div>
 *   <PrintButton contentRef={ref} documentTitle="Customers" />
 *
 * Usage B — wrap children automatically (no external ref needed):
 *   <PrintButton documentTitle="Report" label="Print Report">
 *     <MyPrintableContent />
 *   </PrintButton>
 */
function PrintButton({
  contentRef,          // external ref to the element to print
  documentTitle = 'Print',
  label,               // text label; omit for icon-only
  variant = 'ghost',   // 'ghost' | 'primary' | 'default'
  size = 'sm',         // 'sm' | 'md'
  className = '',
  title = 'Print',
  children,            // wrap mode: children are rendered hidden, printed on click
}) {
  const internalRef = useRef(null);
  const targetRef = contentRef || internalRef;

  const handlePrint = useReactToPrint({
    contentRef: targetRef,
    documentTitle,
  });

  return (
    <>
      {/* Wrap mode: hidden printable container */}
      {children && (
        <div ref={internalRef} className="pb-hidden-content">
          {children}
        </div>
      )}

      <button
        type="button"
        className={`pb-btn pb-btn--${variant} pb-btn--${size} ${className}`}
        onClick={handlePrint}
        title={title}
        aria-label={title}
      >
        <FiPrinter className="pb-icon" />
        {label && <span className="pb-label">{label}</span>}
      </button>
    </>
  );
}

export default PrintButton;
