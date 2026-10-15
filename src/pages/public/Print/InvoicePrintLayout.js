import React, { memo, useMemo } from 'react';
import InvoiceHead from './InvoiceHead';
import ReceiptFooter from './ReceiptFooter';
import OrderCommonHeaderComponent from './OrderCommonHeaderComponent';
import DirhamSymbol from '../../../components/Symbols/DirhamSymbol';
import './InvoicePrintLayout.css';

const formatAmount = value => Number(value || 0).toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const InvoicePrintLayout = memo(({ printRef, mainData = {}, finalOrder = [] }) => {
    const vatRate = Number(process.env.REACT_APP_VAT || 5);
    const rows = useMemo(() => (Array.isArray(finalOrder) ? finalOrder : []).filter(Boolean), [finalOrder]);

    const totals = useMemo(() => {
        const subtotal = Number(mainData.subtotalAmount ?? rows.reduce((sum, row) => sum + Number(row.subtotalAmount || 0), 0));
        const vatAmount = Number(mainData.vatAmount ?? (Number(mainData.totalAmount || 0) - subtotal));
        const total = Number(mainData.totalAmount ?? subtotal + vatAmount);
        const ledgerEntries = Array.isArray(mainData.ledgers) ? mainData.ledgers : [];
        const paid = ledgerEntries.length
            ? ledgerEntries.filter(entry => entry.isCredit).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
            : Number(mainData.advanceAmount || 0);
        const advances = ledgerEntries.length
            ? ledgerEntries.filter(entry => String(entry.entryType || '').toLowerCase() === 'advance')
                .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
            : Number(mainData.advanceAmount || 0);

        return {
            subtotal,
            vatAmount,
            total,
            advances,
            balance: Number(mainData.balanceAmount ?? Math.max(total - paid, 0)),
            itemCount: rows.reduce((sum, row) => sum + Number(row.qty || 1), 0),
        };
    }, [mainData, rows]);

    const getDescription = row => {
        const workTypes = Array.isArray(row.workTypes)
            ? row.workTypes.map(workType => workType?.name).filter(Boolean).join(', ')
            : row.workType || '';
        const model = [row.designCategory, row.designModel].filter(Boolean).join(' · ');
        return [workTypes, model].filter(Boolean).join(' — ') || row.description || 'Order item';
    };

    return (
        <div ref={printRef} className="invoice-print">
            <div className="invoice-print__sheet">
                <div className="invoice-print__brand">
                    <InvoiceHead receiptType="TAX INVOICE" />
                </div>

                <OrderCommonHeaderComponent
                    orderNo={mainData.orderNo}
                    customerName={mainData.customerName}
                    orderDate={mainData.orderDate}
                    contact={mainData.customerNumber || mainData.contact1}
                    orderDeliveryDate={mainData.deliveryDate}
                    salesman={mainData.employeeName}
                />

                <main className="invoice-print__body">
                    <table className="invoice-lines">
                        <thead>
                            <tr>
                                <th className="invoice-lines__number">#</th>
                                <th>Description</th>
                                <th className="invoice-lines__qty">Qty</th>
                                <th className="invoice-lines__money">Unit price</th>
                                <th className="invoice-lines__money">Subtotal</th>
                                <th className="invoice-lines__money">VAT ({vatRate}%)</th>
                                <th className="invoice-lines__money">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length ? rows.map((row, index) => {
                                const quantity = Number(row.qty || 1);
                                const subtotal = Number(row.subtotalAmount || 0);
                                const lineVat = Number(row.vatAmount ?? (Number(row.totalAmount || 0) - subtotal));
                                const lineTotal = Number(row.totalAmount ?? subtotal + lineVat);
                                return (
                                    <tr key={row.id || `${getDescription(row)}-${index}`}>
                                        <td className="invoice-lines__number">{index + 1}</td>
                                        <td className="invoice-lines__description">{getDescription(row)}</td>
                                        <td className="invoice-lines__qty">{formatAmount(quantity).replace(/\.00$/, '')}</td>
                                        <td className="invoice-lines__money"><DirhamSymbol amount={formatAmount(subtotal / quantity)} /></td>
                                        <td className="invoice-lines__money"><DirhamSymbol amount={formatAmount(subtotal)} /></td>
                                        <td className="invoice-lines__money"><DirhamSymbol amount={formatAmount(lineVat)} /></td>
                                        <td className="invoice-lines__money"><DirhamSymbol amount={formatAmount(lineTotal)} /></td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={7} className="invoice-print__empty">No active items on this order.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <section className="invoice-totals" aria-label="Invoice totals">
                        <div className="invoice-totals__contact">
                            <strong>Thank you for choosing us</strong>
                            <span>{process.env.REACT_APP_COMPANY_MOBILE || ''}</span>
                            <span>{process.env.REACT_APP_COMPANY_EMAIL || ''}</span>
                        </div>
                        <div className="invoice-totals__values">
                            <div><span>Items</span><strong>{totals.itemCount}</strong></div>
                            <div><span>Subtotal</span><strong><DirhamSymbol amount={formatAmount(totals.subtotal)} /></strong></div>
                            <div><span>VAT ({vatRate}%)</span><strong><DirhamSymbol amount={formatAmount(totals.vatAmount)} /></strong></div>
                            <div className="invoice-totals__grand"><span>Grand total</span><strong><DirhamSymbol amount={formatAmount(totals.total)} /></strong></div>
                            <div><span>Advance paid</span><strong><DirhamSymbol amount={formatAmount(totals.advances)} /></strong></div>
                            <div className="invoice-totals__balance"><span>Balance due</span><strong><DirhamSymbol amount={formatAmount(totals.balance)} /></strong></div>
                        </div>
                    </section>

                    <div className="invoice-print__signature">Received by: __________________________________________</div>
                </main>
                <ReceiptFooter />
            </div>
        </div>
    );
});

InvoicePrintLayout.displayName = 'InvoicePrintLayout';

export default InvoicePrintLayout;
