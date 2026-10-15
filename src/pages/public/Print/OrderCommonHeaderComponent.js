import React, { memo } from 'react';
import { commonLogic } from '../../../utils/commonLogic';
import './OrderCommonHeaderComponent.css';

const dateValue = value => {
    if (!value || Number.isNaN(new Date(value).getTime())) return '—';
    return commonLogic.getHtmlDate(new Date(value), 'ddmmyyyy') || '—';
};

const OrderCommonHeaderComponent = memo(({ orderNo, salesman, customerName, orderDate, contact, orderDeliveryDate, invoiceNo, taxInvoiceNo }) => (
    <section className="invoice-print__order-meta" aria-label="Order and customer information">
        <div className="invoice-order-meta__item invoice-order-meta__order">
            {taxInvoiceNo !== undefined && <><span className="invoice-order-meta__label">Invoice No.</span><strong>{taxInvoiceNo || '—'}</strong></>}
            <span className="invoice-order-meta__label">Order No.</span>
            <strong className="invoice-order-meta__order-number">{orderNo || '—'}</strong>
            {invoiceNo !== undefined && <><span className="invoice-order-meta__label">Invoice Reference</span><strong>{invoiceNo || '—'}</strong></>}
        </div>
        <div className="invoice-order-meta__item">
            <span className="invoice-order-meta__label">Customer</span>
            <strong>{customerName || '—'}</strong>
            <span className="invoice-order-meta__label">Order date</span>
            <span>{dateValue(orderDate)}</span>
        </div>
        <div className="invoice-order-meta__item">
            <span className="invoice-order-meta__label">Contact</span>
            <strong>{contact || '—'}</strong>
            <span className="invoice-order-meta__label">Delivery date</span>
            <span>{dateValue(orderDeliveryDate)}</span>
        </div>
        <div className="invoice-order-meta__item">
            <span className="invoice-order-meta__label">Salesperson</span>
            <strong>{salesman || '—'}</strong>
        </div>
    </section>
));

OrderCommonHeaderComponent.displayName = 'OrderCommonHeaderComponent';
export default OrderCommonHeaderComponent;
