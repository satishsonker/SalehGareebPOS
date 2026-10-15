import React from 'react';
import InvoiceHead from './InvoiceHead';
import OrderCommonHeaderComponent from './OrderCommonHeaderComponent';
import ReceiptFooter from './ReceiptFooter';
import DirhamSymbol from '../../../components/Symbols/DirhamSymbol';
import { commonLogic } from '../../../utils/commonLogic';
import './PaymentReceiptPrintLayout.css';

const displayValue = value => value === undefined || value === null || value === '' ? '—' : value;
const dateValue = value => {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return commonLogic.getHtmlDate(new Date(value), 'ddmmyyyyhhmm') || '—';
};

export default function PaymentReceiptPrintLayout({ printRef, order, payment }) {
  const amount = Number(payment?.amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div ref={printRef} className="payment-receipt-print">
      <div className="payment-receipt-print__sheet">
        <header className="payment-receipt-print__brand"><InvoiceHead receiptType="PAYMENT RECEIPT" hideTrnNo /></header>
        <OrderCommonHeaderComponent
          orderNo={payment?.orderNo || order?.orderNo || payment?.orderId || order?.id}
          customerName={payment?.customerName || order?.customerName}
          orderDate={payment?.orderDate || order?.orderDate}
          contact={payment?.customerNumber || order?.customerNumber || order?.phone}
          orderDeliveryDate={payment?.deliveryDate || order?.deliveryDate}
          salesman={payment?.employeeName || order?.employeeName}
        />
        <main className="payment-receipt-print__body">
          <h1>Payment Receipt</h1>
          <dl className="payment-receipt-print__details">
            <div><dt>Receipt date</dt><dd>{dateValue(payment?.transactionDate || payment?.date)}</dd></div>
            <div><dt>Payment method</dt><dd>{displayValue(payment?.method || payment?.paymentMode || payment?.entryType)}</dd></div>
            <div><dt>Reference</dt><dd>{displayValue(payment?.reference)}</dd></div>
            <div><dt>Receipt no.</dt><dd>{displayValue(payment?.receiptNo || payment?.id)}</dd></div>
            <div className="payment-receipt-print__remarks"><dt>Remarks</dt><dd>{displayValue(payment?.remarks || payment?.note)}</dd></div>
          </dl>
          <div className="payment-receipt-print__amount">
            <span>Amount received</span>
            <strong><DirhamSymbol amount={amount} size="14" /></strong>
          </div>
          <div className="payment-receipt-print__signatures">
            <span>Received by: __________________________</span>
            <span>Customer signature: __________________________</span>
          </div>
        </main>
        <ReceiptFooter message="THANK YOU FOR YOUR PAYMENT" />
      </div>
    </div>
  );
}
