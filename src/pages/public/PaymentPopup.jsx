import React, { useEffect, useMemo, useState } from 'react';
import { getOrderById, getOrders, updateOrder, addOrderPayment, getOrderPayments } from '../../services/api/ordersApi';
import { getpaymentByCustomer,addPayment } from '../../services/api/paymentApi';
import { getMasterDataByTypes } from '../../services/api/masterDataApi';
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
        if (Array.isArray(currentOrder.ledgers) && currentOrder.ledgers.length > 0) return currentOrder.ledgers;
        return [];
    }, [currentOrder]);

    const fetchCustomerPayments = async () => {
        if (!currentOrder) return;
        setCustomerPaymentsLoading(true);
        try {
            const res = await getpaymentByCustomer(currentOrder.customerId);
            setCustomerPayments(res || []);
        } catch (err) {
            console.warn('Could not load customer payments', err);
            setCustomerPayments([]);
        } finally {
            setCustomerPaymentsLoading(false);
        }
    };

    const printPayment = (payment) => {
        const html = `<html><head><title>Payment Receipt</title></head><body><div style="font-family: Arial; padding:20px;"><h2>Payment Receipt</h2><p><strong>Order:</strong> ${payment.orderNo || payment.orderId || '-'}</p><p><strong>Amount:</strong> ₹${formatMoney(payment.amount)}</p><p><strong>Method:</strong> ${payment.method || payment.entryType || payment.type || 'Payment'}</p><p><strong>Date:</strong> ${formatDate(payment.transactionDate || payment.transactionDate || payment.date)}</p><p><strong>Note:</strong> ${payment.remarks || payment.note || ''}</p></div></body></html>`;
        const w = window.open('', '_blank', 'width=400,height=600');
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); }, 250);
    };

    const totalBalance = useMemo(() => {
        if (!currentOrder) return 0;
        const total = Number(currentOrder.totalAmount ?? currentOrder.totalInvoiced ?? 0);
        const paid = Number(currentOrder.advanceAmount ?? 0);
        return Math.max(total - paid, 0);
    }, [currentOrder]);

    const customerOutstanding = useMemo(() => {
        return customerOrders.reduce((sum, candidate) => {
            const total = Number(candidate.totalAmount ?? candidate.totalInvoiced ?? 0);
            const paid = Number(candidate.advanceAmount ?? 0);
            return sum + Math.max(total - paid, 0);
        }, 0);
    }, [customerOrders]);

    const handleSubmit = async () => {
        if (!currentOrder || !form.amount || Number(form.amount) <= 0) return;

        setSaving(true);

        try {
            const nextEntry = {
                id: 0,
                amount: Number(form.amount),
                method: form.method || 'Cash',
                date: new Date().toISOString(),
                entryType: 'Payment',
                transactionDate: new Date().toISOString(),
                remarks: form.note || 'Manual payment from POS',
                orderId: currentOrder.id,
                orderNo: currentOrder.orderNo || currentOrder.id,
                customerId: currentOrder.customerId,
                customerName: currentOrder.customerName || '',
            };
            // Try to persist the payment via dedicated endpoint first
            try {
                await addPayment(nextEntry);
            } catch (err) {
                // fallback to updating the order record if payments endpoint isn't available
                const nextPaymentHistory = [...paymentHistory, nextEntry];
                const nextAdvance = Number(currentOrder.advanceAmount || 0) + Number(form.amount);
                const nextOrder = {
                    ...currentOrder,
                    paymentHistory: nextPaymentHistory,
                    payments: nextPaymentHistory,
                    advanceAmount: nextAdvance,
                    balanceAmount: Math.max((Number(currentOrder.totalAmount ?? currentOrder.totalInvoiced ?? 0) - nextAdvance), 0)
                };

                const result = await updateOrder(currentOrder.id, nextOrder);
                const savedOrder = result?.data?.data ?? result?.data ?? nextOrder;
                setCurrentOrder(savedOrder);
                setForm({ amount: '', method: 'Cash', note: '' });
                onSaved?.(savedOrder);
                setSaving(false);
                return;
            }

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
        <div className="so-modal__content">
            <div className="so-modal__tabs" role="tablist">
                <button role="tab" aria-selected={activeTab === 'current'} type="button" className={`so-modal__tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>Current Order</button>
                <button role="tab" aria-selected={activeTab === 'customer'} type="button" className={`so-modal__tab ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>Payment History</button>
                <button role="tab" aria-selected={activeTab === 'add'} type="button" className={`so-modal__tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>Add Payment</button>
            </div>

            <div className="so-modal__panel">
                {activeTab === 'current' && (
                    <>
                        <div className="so-modal__section">
                            <h3>Current Order Balance</h3>
                            <div className="so-modal__summary">
                                <div className="so-modal__group">
                                    <span>Order</span>
                                    <strong>{currentOrder.orderNo || currentOrder.id}</strong>
                                </div>
                                <div className="so-modal__group">
                                    <span>Customer</span>
                                    <strong>{currentOrder.customerName || '-'}</strong>
                                </div>
                                <div className="so-modal__group">
                                    <span>Total</span>
                                    <strong>₹{formatMoney(currentOrder.totalAmount ?? currentOrder.totalInvoiced ?? 0)}</strong>
                                </div>
                                <div className="so-modal__group">
                                    <span>Balance Due</span>
                                    <strong>₹{formatMoney(totalBalance)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="so-modal__section">
                            <h3>Current Order Payment History</h3>
                            <div className="so-modal__items">
                                {paymentHistory.length > 0 ? (
                                    paymentHistory.map((payment, index) => (
                                        <div key={payment.id || `${payment.date || index}-${payment.amount}`} className="so-modal__item">
                                            <div className="so-modal__item-header">
                                                <strong>{payment.method || 'Cash'}</strong>
                                                <span>₹{formatMoney(payment.amount)}</span>
                                            </div>
                                            <p>{formatDate(payment.transactionDate)} • {payment.entryType || 'Payment entry'}</p>
                                            <div className="so-modal__actions">
                                                <button type="button" className="so-modal__secondary" onClick={() => printPayment(payment)}>Print Slip</button>
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
                        <h3>Customer Payment History (All Orders)</h3>
                        {customerPaymentsLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="so-modal__items">
                                {customerPayments.filter(p => p.orderId !== currentOrder.id).length > 0 ? (
                                    customerPayments.filter(p => p.orderId !== currentOrder.id).map((payment, idx) => (
                                        <div key={payment.id || idx} className="so-modal__item">
                                            <div className="so-modal__item-header">
                                                <strong>{payment.method || payment.entryType || payment.type || 'Payment'} • {formatDate(payment.paymentMode)}</strong>
                                                <span>₹{formatMoney(payment.amount)}</span>
                                            </div>
                                            <p>
                                                <strong>Order:</strong> {payment.orderNo  || '-'} • {formatDate(payment.transactionDate || payment.date)}
                                            </p>
                                            <p>{payment.remarks || payment.note || ''}</p>
                                            <div className="so-modal__actions">
                                                <button type="button" className="so-modal__secondary" onClick={() => printPayment(payment)}>Print Slip</button>
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
                        <h3>Add Payment</h3>
                        <div className="so-modal__grid so-modal__grid--compact">
                            <div>
                                <span>Amount</span>
                                <input type="number" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="0.00" />
                            </div>
                            <div>
                                <span>Method</span>
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
                            </div>
                            <div className="so-modal__span-2">
                                <span>Note</span>
                                <input type="text" value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} placeholder="Payment note" />
                            </div>
                        </div>
                        <div className="so-modal__actions">
                            <button type="button" className="so-modal__primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Add Payment'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
