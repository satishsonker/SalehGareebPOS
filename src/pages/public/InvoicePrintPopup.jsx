import React from 'react';
import PrintOrderReceiptPopup from './Order/PrintOrderReceiptPopup';

export default function InvoicePrintPopup({ orderId, isOpen, onClose }) {
  if (!isOpen || !orderId) return null;

  return (
    <PrintOrderReceiptPopup
      orderId={orderId}
      isOpen={isOpen}
      showInPupop
      onClosePrintOrderReceiptPopup={onClose}
      setPrintReceiptHandler={() => {}}
      modelId={`invoice-${orderId}`}
    />
  );
}
