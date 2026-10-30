import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCalendar, FiCreditCard, FiDollarSign, FiFileText, FiClock, FiPlusCircle, FiPrinter, FiUser } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { getOrderById, addOrderPayment, getOrderPayments } from '../../services/api/ordersApi';
import { getpaymentByCustomer } from '../../services/api/paymentApi';
import { getMasterDataByTypes } from '../../services/api/masterDataApi';
import PaymentReceiptPrintLayout from './Print/PaymentReceiptPrintLayout';
import './PaymentPopup.css';
const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

const formatMoney = (value) => {
    const safeValue = Number(value || 0);
    return safeValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const normalizeCustomerKey = (value) => String(value || '').trim().toLowerCase();
const isCustomerPayment = entry => ['advance', 'payment'].includes(String(entry?.entryType ?? entry?.type ?? '').trim().toLowerCase());
const isOrderCancelled = order => {
    const status = String(order?.statusStr ?? order?.status ?? '').trim().toLowerCase();
    return ['cancelled', 'canceled', 'deleted'].includes(status) || [8, 9].includes(Number(order?.status));
};

export default function PaymentPopup({ order, onClose, onSaved }) {
    const [currentOrder, setCurrentOrder] = useState(order || null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('current'); // 'current' | 'customer' | 'add'
    const [customerPayments, setCustomerPayments] = useState([]);
    const [customerPaymentsLoading, setCustomerPaymentsLoading] = useState(false);
    const [form, setForm] = useState({ amount: '', method: 'Cash', note: '' });
    const [paymentModeList, setPaymentModeList] = useState([])
    const [receiptPayment, setReceiptPayment] = useState(null);
    const paymentPrintRef = useRef(null);
    const handlePrintReceipt = useReactToPrint({
        contentRef: paymentPrintRef,
        documentTitle: `Payment-Receipt-${currentOrder?.orderNo || currentOrder?.id || 'Order'}`,
        pageStyle: '@page { size: A4; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
        onAfterPrint: () => setReceiptPayment(null),
    });

    useEffect(() => {
        if (receiptPayment) handlePrintReceipt();
    }, [receiptPayment, handlePrintReceipt]);
    useEffect(() => {
        const loadOrder = async () => {
            if (!order?.id) return;
            setLoading(true);
            try {
                const response = await getOrderById(order.id);
                const detail = response?.data?.data ?? response?.data ?? order;
                setCurrentOrder(detail);
            } catch (error) {
                setCurrentOrder(order);
                setCustomerOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [order]);

    useEffect(() => {
        const loadPaymentModes = async () => {
            try {
                const res = await getMasterDataByTypes(['payment_mode']);
                const paymentModes = res?.data?.data ?? res?.data ?? [];
                setPaymentModeList(paymentModes);
            } catch (err) {
                console.warn('Could not load payment modes', err);
                setPaymentModeList([]);
            }
        };

        loadPaymentModes();
    }, []);

    const paymentHistory = useMemo(() => {
        if (!currentOrder) return [];
        if (Array.isArray(currentOrder.ledgers) && currentOrder.ledgers.length > 0) return currentOrder.ledgers.filter(isCustomerPayment);
        return [];
    }, [currentOrder]);

    const fetchCustomerPayments = async () => {
        if (!currentOrder) return;
        setCustomerPaymentsLoading(true);
        try {
            const res = await getpaymentByCustomer(currentOrder.customerId);
            setCustomerPayments((res || []).filter(isCustomerPayment));
        } catch (err) {
            console.warn('Could not load customer payments', err);
            setCustomerPayments([]);
        } finally {
            setCustomerPaymentsLoading(false);
        }
    };

    const printPayment = payment => setReceiptPayment(payment);

    const rawBalance = useMemo(() => {
        if (!currentOrder) return 0;
        if (Number.isFinite(Number(currentOrder.balanceAmount))) return Number(currentOrder.balanceAmount);
        const total = Number(currentOrder.totalAmount ?? currentOrder.totalInvoiced ?? 0);
        const paid = Number(currentOrder.advanceAmount ?? 0);
        return total - paid;
    }, [currentOrder]);
    const totalBalance = Math.max(rawBalance, 0);
    const customerCredit = Math.max(-rawBalance, 0);

    const customerOutstanding = useMemo(() => {
        return customerOrders.reduce((sum, candidate) => {
            const total = Number(candidate.totalAmount ?? candidate.totalInvoiced ?? 0);
            const paid = Number(candidate.advanceAmount ?? 0);
            return sum + Math.max(total - paid, 0);
        }, 0);
    }, [customerOrders]);
    const paymentBlocked = isOrderCancelled(currentOrder) || totalBalance <= 0;

    const handleSubmit = async () => {
        if (!currentOrder || !form.amount || Number(form.amount) <= 0) return;

        setSaving(true);

        try {
            await addOrderPayment(currentOrder.id, {
                amount: Number(form.amount),
                paymentMode: form.method || 'Cash',
                remarks: form.note || 'Manual payment from POS',
            });

            // reload order and payments after successful add
            let finalSavedOrder = currentOrder;
            try {
                const refreshed = await getOrderById(currentOrder.id);
                finalSavedOrder = refreshed?.data?.data ?? refreshed?.data ?? currentOrder;
                // try to fetch payments endpoint for canonical history
                try {
                    const paymentsRes = await getOrderPayments(currentOrder.id);
                    const payments = paymentsRes?.data?.data ?? paymentsRes?.data ?? null;
                    if (payments) finalSavedOrder.paymentHistory = payments;
                } catch (_) {
                    // ignore
                }
                setCurrentOrder(finalSavedOrder);
            } catch (err) {
                console.warn('Could not refresh order after payment add', err);
            }
            setForm({ amount: '', method: 'Cash', note: '' });
            onSaved?.(finalSavedOrder);
        } catch (error) {
            console.error('Payment update failed', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'customer' || activeTab === 'add') {
            fetchCustomerPayments();
        }
    }, [activeTab, currentOrder]);

    if (!currentOrder) return null;

    return (
        <>
        <div className="so-modal__content payment-popup">
            <div className="so-modal__tabs" role="tablist">
                <button role="tab" aria-selected={activeTab === 'current'} type="button" className={`so-modal__tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}><FiFileText /> Current Order</button>
                <button role="tab" aria-selected={activeTab === 'customer'} type="button" className={`so-modal__tab ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}><FiClock /> Payment History</button>
                <button role="tab" aria-selected={activeTab === 'add'} type="button" className={`so-modal__tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}><FiPlusCircle /> Add Payment</button>
            </div>

            <div className="so-modal__panel">
                {activeTab === 'current' && (
                    <>
                        <div className="so-modal__section">
                            <h3><FiDollarSign /> Current Order Balance</h3>
                            <div className="so-modal__summary">
                                <div className="so-modal__group pp-summary-item pp-summary-item--order">
                                    <FiFileText className="pp-summary-item__icon" />
                                    <span>Order</span>
                                    <strong>{currentOrder.orderNo || currentOrder.id}</strong>
                                </div>
                                <div className="so-modal__group pp-summary-item pp-summary-item--customer">
                                    <FiUser className="pp-summary-item__icon" />
                                    <span>Customer</span>
                                    <strong>{currentOrder.customerName || '-'}</strong>
                                </div>
                                <div className="so-modal__group pp-summary-item pp-summary-item--total">
                                    <FiDollarSign className="pp-summary-item__icon" />
                                    <span>Total</span>
                                    <strong>₹{formatMoney(currentOrder.totalAmount ?? currentOrder.totalInvoiced ?? 0)}</strong>
                                </div>
                                <div className={`so-modal__group pp-summary-item ${totalBalance > 0 ? 'pp-summary-item--due' : 'pp-summary-item--settled'}`}>
                                    <FiCreditCard className="pp-summary-item__icon" />
                                    <span>{customerCredit > 0 ? 'Customer Credit' : 'Balance Due'}</span>
                                    <strong>₹{formatMoney(customerCredit || totalBalance)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="so-modal__section">
                            <h3><FiClock /> Current Order Payment History</h3>
                            <div className="so-modal__items">
                                {paymentHistory.length > 0 ? (
                                    paymentHistory.map((payment, index) => (
                                        <div key={payment.id || `${payment.date || index}-${payment.amount}`} className="so-modal__item">
                                            <div className="so-modal__item-header pp-payment-entry">
                                                <span className="pp-payment-entry__icon"><FiCreditCard /></span>
                                                <strong>{payment.method || 'Cash'}</strong>
                                                <span className="pp-payment-entry__amount">₹{formatMoney(payment.amount)}</span>
                                            </div>
                                            <p className="pp-payment-entry__date"><FiCalendar /> {formatDate(payment.transactionDate)} • {payment.entryType || 'Payment entry'}</p>
                                            <div className="so-modal__actions">
                                                <button type="button" className="so-modal__secondary pp-print-btn" onClick={() => printPayment(payment)}><FiPrinter /> Print Slip</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="so-modal__empty">No payment history available.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'customer' && (
                    <div className="so-modal__section">
                        <h3><FiUser /> Customer Payment History (All Orders)</h3>
                        {customerPaymentsLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="so-modal__items">
                                {customerPayments.filter(p => p.orderId !== currentOrder.id).length > 0 ? (
                                    customerPayments.filter(p => p.orderId !== currentOrder.id).map((payment, idx) => (
                                        <div key={payment.id || idx} className="so-modal__item">
                                            <div className="so-modal__item-header pp-payment-entry">
                                                <span className="pp-payment-entry__icon"><FiCreditCard /></span>
                                                <strong>{payment.method || payment.entryType || payment.type || 'Payment'} • {formatDate(payment.paymentMode)}</strong>
                                                <span className="pp-payment-entry__amount">₹{formatMoney(payment.amount)}</span>
                                            </div>
                                            <p>
                                                <strong>Order:</strong> {payment.orderNo  || '-'} • {formatDate(payment.transactionDate || payment.date)}
                                            </p>
                                            <p>{payment.remarks || payment.note || ''}</p>
                                            <div className="so-modal__actions">
                                                <button type="button" className="so-modal__secondary pp-print-btn" onClick={() => printPayment(payment)}><FiPrinter /> Print Slip</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="so-modal__empty">No customer payments available.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="so-modal__section">
                        <h3><FiPlusCircle /> Add Payment</h3>
                        {paymentBlocked && <div className="so-modal__empty">This order is cancelled or has no balance due.</div>}
                        <div className="so-modal__grid so-modal__grid--compact">
                            <label className="pp-form-field">
                                <span className="pp-form-field__label"><FiDollarSign /> Amount</span>
                                <span className="pp-input-wrap">
                                    <FiDollarSign />
                                    <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="0.00" />
                                </span>
                            </label>
                            <label className="pp-form-field">
                                <span className="pp-form-field__label"><FiCreditCard /> Method</span>
                                <span className="pp-input-wrap pp-select-wrap">
                                    <FiCreditCard />
                                    <select value={form.method} onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}>
                                        {paymentModeList.length > 0 ? (
                                            paymentModeList.map((mode) => (
                                                <option key={mode.id || mode.value} value={mode.code}>{mode.displayValue || mode.value}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="App">App</option>
                                            </>
                                        )}
                                    </select>
                                </span>
                            </label>
                            {/* Note */}
                            <label className="pp-form-field so-modal__span-2">
                                <span className="pp-form-field__label"><FiFileText /> Note</span>
                                <span className="pp-input-wrap">
                                    <FiFileText />
                                    <input type="text" value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} placeholder="Payment note" />
                                </span>
                            </label>
                        </div>
                        <div className="so-modal__actions">
                            <button type="button" className="so-modal__primary pp-submit-btn" onClick={handleSubmit} disabled={saving || paymentBlocked}><FiPlusCircle /> {saving ? 'Saving...' : 'Add Payment'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <div className="payment-receipt-print-host" aria-hidden="true">
            <PaymentReceiptPrintLayout printRef={paymentPrintRef} order={currentOrder} payment={receiptPayment || {}} />
        </div>
        </>
    );
}
