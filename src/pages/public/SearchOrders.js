import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiSearch,
    FiFilter,
    FiHash,
    FiUser,
    FiPhone,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiDollarSign,
    FiPackage,
    FiRefreshCw,
    FiX,
    FiCreditCard,
    FiScissors,
    FiActivity,
    FiPrinter,
    FiEye,
    FiClipboard,
    FiMapPin,
    FiTruck,
} from "react-icons/fi";
import { getOrders, getOrderById, getCustomerOrders, deliverSubOrders } from "../../services/api/ordersApi";
import Modal from "../../components/Modal/Modal";
import PaymentPopup from "./PaymentPopup";
import MeasurementPopup from "./MeasurementPopup";
import StatusPopup from "./StatusPopup";
import InvoicePrintPopup from "./InvoicePrintPopup";
import "./SearchOrders.css";

const FILTERS = [
    { id: "all", label: "All", icon: FiFilter },
    { id: "orderNo", label: "Order No", icon: FiHash },
    { id: "phone", label: "Phone", icon: FiPhone },
    { id: "customer", label: "Customer", icon: FiUser }
];

const ORDER_STEPS = [
    { key: "active", label: "Active" },
    { key: "processing", label: "Processing" },
    { key: "completed", label: "Completed" },
    { key: "packing", label: "Packing" },
    { key: "delivered", label: "Delivered" }
];

const normalizeStatus = status =>
    String(status || "active")
        .trim()
        .toLowerCase();

const getStatusIndex = status => {
    const normalized = normalizeStatus(status);

    if (normalized === "active") return 0;
    if (normalized === "processing") return 1;
    if (normalized === "cancel" || normalized === "cancelled") return 1;
    if (normalized === "completed") return 2;
    if (normalized === "packing") return 3;
    if (
        normalized === "delivered" ||
        normalized === "partial delivered" ||
        normalized === "partial-delivered"
    ) {
        return 4;
    }

    return 0;
};

const isCancelled = status => {
    const normalized = normalizeStatus(status);
    return normalized === "cancel" || normalized === "cancelled";
};

const isPartialCancelled = order => {
    const normalized = normalizeStatus(order?.statusStr || order?.status);
    if (["partialcancelled", "partial cancelled", "partial-cancelled"].includes(normalized)) return true;

    const details = Array.isArray(order?.orderDetails) ? order.orderDetails : [];
    const cancelledCount = details.filter(detail => isCancelled(detail?.statusStr || detail?.status)).length;
    return cancelledCount > 0 && cancelledCount < details.length;
};

const isPartialDelivered = status => {
    const normalized = normalizeStatus(status);
    return (
        normalized === "partial delivered" ||
        normalized === "partial-delivered"
    );
};

const formatDate = dateStr => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatAmount = amount =>
    Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getStatusLabel = status => {
    const normalized = normalizeStatus(status);

    if (isPartialDelivered(normalized)) return "Partial Delivered";
    if (["partialcancelled", "partial cancelled", "partial-cancelled"].includes(normalized)) return "Partial Cancelled";
    if (isCancelled(normalized)) return "Cancelled";
    if (normalized === "active") return "Active";
    if (normalized === "processing") return "Processing";
    if (normalized === "completed") return "Completed";
    if (normalized === "packing") return "Packing";
    if (normalized === "delivered") return "Delivered";

    return "Active";
};

const getOrderPaymentHistory = order => {
    if (Array.isArray(order?.paymentHistory) && order.paymentHistory.length > 0) return order.paymentHistory;
    if (Array.isArray(order?.payments) && order.payments.length > 0) return order.payments;

    return [
        {
            id: 1,
            amount: Number(order?.advanceAmount || order?.totalInvoiced || 0),
            method: order?.paymentMode || "Cash",
            date: order?.orderDate || new Date().toISOString(),
            note: "Initial deposit"
        }
    ];
};

const getWorkTypeStatus = status => {
    const normalized = normalizeStatus(status);

    if (normalized === "done" || normalized === "completed" || normalized === "finished") return "Done";
    if (normalized === "pending" || normalized === "in-progress" || normalized === "in progress") return "Pending";
    if (normalized === "processing") return "In Progress";
    return "Pending";
};

function Pagination({ currentPage, totalPages, totalRecords, pageSize, onPageChange }) {
    const safeTotalPages = Math.max(1, Number(totalPages) || 1);
    const startIndex = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = totalRecords === 0 ? 0 : Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="so-pagination">
            <span className="so-pagination__meta">
                {totalRecords > 0
                    ? `Showing ${startIndex}-${endIndex} of ${totalRecords}`
                    : "No records"}
            </span>

            <div className="so-pagination__controls">
                <button
                    type="button"
                    className="so-pagination__button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    <FiChevronLeft size={14} />
                </button>

                <span className="so-pagination__page">
                    {currentPage} / {safeTotalPages}
                </span>

                <button
                    type="button"
                    className="so-pagination__button"
                    disabled={currentPage >= safeTotalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    <FiChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

function getOrderStatusDate(history, status, orderDate) {
    const normalizedStatus = normalizeStatus(status);
    const statusHistory = Array.isArray(history) ? history : [];
    const match = statusHistory
        .filter(entry => normalizeStatus(entry?.newStatusStr || entry?.newStatus) === normalizedStatus)
        .sort((a, b) => new Date(a.changedOnUtc) - new Date(b.changedOnUtc))[0];

    if (match?.changedOnUtc) return formatDate(match.changedOnUtc);
    if (normalizedStatus === "active" && orderDate) return formatDate(orderDate);
    return "—";
}

function OrderStatusTimeline({ status, history, orderDate, orderDetails = [] }) {
    const cancelled = isCancelled(status);
    const timelineSteps = cancelled
        ? [{ key: "active", label: "Active" }, { key: "cancelled", label: "Cancelled" }]
        : ORDER_STEPS;
    const currentIndex = cancelled ? 1 : getStatusIndex(status);
    const partialDelivered = isPartialDelivered(status);
    const totalSubOrders = orderDetails.length;
    const stageCounts = {
        completed: orderDetails.filter(item => normalizeStatus(item.statusStr || item.status) === 'completed').length,
        packing: orderDetails.filter(item => normalizeStatus(item.statusStr || item.status) === 'packing').length,
        delivered: orderDetails.filter(item => normalizeStatus(item.statusStr || item.status) === 'delivered').length,
    };

    return (
        <div className="so-timeline">
            {timelineSteps.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                    <React.Fragment key={step.key}>
                        <div
                            className={`so-timeline__step ${isCompleted
                                    ? "so-timeline__step--completed"
                                    : ""
                                } ${isCurrent
                                    ? "so-timeline__step--current"
                                    : ""
                                } ${cancelled && isCurrent
                                    ? "so-timeline__step--cancelled"
                                    : ""
                                }`}
                        >
                            <div className="so-timeline__dot">
                                {isCompleted ? "✓" : index + 1}
                            </div>

                            <span className="so-timeline__label">{step.label}{totalSubOrders && stageCounts[step.key] !== undefined ? ` ${stageCounts[step.key]}/${totalSubOrders}` : ''}</span>
                            <span className="so-timeline__date">
                                {getOrderStatusDate(history, step.key, orderDate)}
                            </span>
                        </div>

                        {index < timelineSteps.length - 1 && (
                            <div
                                className={`so-timeline__line ${cancelled
                                        ? "so-timeline__line--cancelled"
                                        : index < currentIndex
                                        ? "so-timeline__line--completed"
                                        : ""
                                    }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {partialDelivered && (
                <div className="so-timeline__branch so-timeline__branch--partial">
                    Partial Delivered
                </div>
            )}
        </div>
    );
}

function OrderCard({ order, onViewClick, onActionClick, onCustomerHistoryClick }) {
    const orderStatus = order?.statusStr || order?.status;
    const status = normalizeStatus(orderStatus);
    const statusLabel = getStatusLabel(orderStatus);
    const partialCancelled = isPartialCancelled(order);

    return (
        <div
            className="so-card"
            onClick={() => onViewClick(order)}
        >
            <div className={`so-card__header ${partialCancelled ? "so-card__header--partial-cancelled" : ""}`}>
                <div className="so-card__order">
                    <span>ORDER NO.</span>
                    <strong>
                        {order?.orderNo ?? order?.id ?? "-"} - {order?.qty ?? 0} Sub Order(s)
                    </strong>
                </div>

                <div
                    className={`so-card__status so-card__status--${status.replace(
                        /\s+/g,
                        "-"
                    )} ${partialCancelled ? "so-card__status--partialcancelled" : ""}`}
                >
                    {statusLabel}
                </div>
            </div>

            <div className="so-card__details">
                <div className="so-detail so-detail--customer">
                    <div className="so-detail__icon">
                        <FiUser />
                    </div>
                    <div className="so-detail__content">
                        <span>Customer Name</span>
                        <strong>
                            {order?.customerName || "-"}
                        </strong>
                    </div>
                </div>

                <div className="so-detail">
                    <div className="so-detail__icon">
                        <FiPhone />
                    </div>
                    <div className="so-detail__content">
                        <span>Customer Number</span>
                        <strong>
                            {order?.phone ||
                                order?.customerNumber ||
                                "-"}
                        </strong>
                    </div>
                </div>

                <div className="so-detail">
                    <div className="so-detail__icon">
                        <FiCalendar />
                    </div>
                    <div className="so-detail__content">
                        <span>Order Date</span>
                        <strong>
                            {formatDate(order?.orderDate)}
                        </strong>
                    </div>
                </div>

                <div className="so-detail">
                    <div className="so-detail__icon">
                        <FiCalendar />
                    </div>
                    <div className="so-detail__content">
                        <span>Delivery Date</span>
                        <strong>
                            {formatDate(order?.deliveryDate)}
                        </strong>
                    </div>
                </div>

                <div className="so-detail so-detail--amount">
                    <div className="so-detail__icon">
                        <FiDollarSign />
                    </div>
                    <div className="so-detail__content">
                        <span>Total Amount</span>
                        <strong>
                            ₹{formatAmount(order?.totalInvoiced)}
                        </strong>
                    </div>
                </div>

                <div className="so-detail so-detail--amount">
                    <div className="so-detail__icon">
                        <FiPackage />
                    </div>
                    <div className="so-detail__content">
                        <span>Advance Amount</span>
                        <strong>
                            ₹{formatAmount(order?.advanceAmount)}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="so-card__footer">
                <OrderStatusTimeline
                    status={orderStatus}
                    history={order?.orderStatusHistory}
                    orderDate={order?.orderDate}
                    orderDetails={order?.orderDetails}
                />

                <div className="so-card__actions">
                    <button
                        type="button"
                        className="so-action-btn so-action-btn--success"
                        onClick={event => {
                            event.stopPropagation();
                            onActionClick(order, 'payment');
                        }}
                    >
                        <FiCreditCard size={15} /> Payment
                    </button>
                    <button type="button" className="so-action-btn so-action-btn--success" onClick={event => { event.stopPropagation(); onCustomerHistoryClick(order); }}>
                        <FiDollarSign size={15} /> Customer Balance
                    </button>
                    {order?.orderDetails?.some(item => normalizeStatus(item.statusStr || item.status) === 'packing') && <button type="button" className="so-action-btn so-action-btn--primary" onClick={event => { event.stopPropagation(); onActionClick(order, 'deliver'); }}>
                        <FiTruck size={15} /> Deliver
                    </button>}
                    <button
                        type="button"
                        className="so-action-btn so-action-btn--info"
                        onClick={event => {
                            event.stopPropagation();
                            onActionClick(order, 'measurement');
                        }}
                    >
                        <FiScissors size={15} /> Measurement
                    </button>
                    <button
                        type="button"
                        className="so-action-btn so-action-btn--warning"
                        onClick={event => {
                            event.stopPropagation();
                            onActionClick(order, 'status');
                        }}
                    >
                        <FiActivity size={15} /> Status
                    </button>
                    <button
                        type="button"
                        className="so-action-btn so-action-btn--primary"
                        onClick={event => {
                            event.stopPropagation();
                            onActionClick(order, 'print');
                        }}
                    >
                        <FiPrinter size={15} /> Print
                    </button>
                    <button
                        type="button"
                        className="so-view-btn"
                        onClick={event => {
                            event.stopPropagation();
                            onViewClick(order);
                        }}
                    >
                        <FiEye size={15} /> View
                        <FiChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SearchOrders() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [activeModalType, setActiveModalType] = useState("view");
    const [paymentDraft, setPaymentDraft] = useState({ amount: "", method: "Cash", note: "" });
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [customerHistoryOpen, setCustomerHistoryOpen] = useState(false);
    const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [customerHistoryError, setCustomerHistoryError] = useState('');
    const [deliveryIds, setDeliveryIds] = useState([]);
    const [deliveryPayment, setDeliveryPayment] = useState({ amount: '', mode: 'Cash', reference: '' });
    const [deliverySaving, setDeliverySaving] = useState(false);
    const [deliveryError, setDeliveryError] = useState('');
    const debounceRef = useRef(null);

    const fetchOrders = useCallback((q = "", page = 1, size = pageSize) => {
        setLoading(true);
        setError("");

        getOrders(page, size, q, activeFilter)
            .then(res => {
                const payload = res?.data ?? {};
                const orderList = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(res?.data)
                        ? res.data
                        : [];

                setOrders(orderList);
                setTotalRecords(Number(payload?.totalRecords ?? orderList.length ?? 0));
            })
            .catch(() => setError('Failed to load orders.'))
            .finally(() => setLoading(false));
    }, [pageSize, activeFilter]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            setPageNo(1);
            fetchOrders(query, 1, pageSize);
        }, 650);

        return () => clearTimeout(debounceRef.current);
    }, [query, activeFilter, fetchOrders, pageSize]);

    const handleFilterChange = id => {
        setActiveFilter(id);
        setQuery("");
        setPageNo(1);
    };

    const handlePageChange = nextPage => {
        const safePage = Math.max(1, nextPage);
        setPageNo(safePage);
        fetchOrders(query, safePage, pageSize);
    };

    const handleClearSearch = () => {
        setQuery("");
        setPageNo(1);
    };

    const handleReload = () => {
        fetchOrders(query, pageNo, pageSize);
    };

    const fetchOrderForModal = async (order, modalType = "view") => {
        if (!order?.id) return;

        setDetailLoading(true);
        setDetailError("");

        try {
            const res = await getOrderById(order.id);
            const detail = res?.data?.data ?? res?.data ?? {};
            setSelectedOrder(detail);
            setActiveModalType(modalType);
            setIsDetailModalOpen(true);
        } catch {
            setSelectedOrder(order);
            setActiveModalType(modalType);
            setIsDetailModalOpen(true);
            setDetailError('Failed to load order details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOrderClick = async (order) => {
        await fetchOrderForModal(order, "view");
    };

    const handleActionClick = async (order, modalType) => {
        await fetchOrderForModal(order, modalType);
        if (modalType === 'deliver') {
            setDeliveryIds((order?.orderDetails || []).filter(item => normalizeStatus(item.statusStr || item.status) === 'packing').map(item => item.id));
            setDeliveryPayment({ amount: '', mode: 'Cash', reference: '' });
            setDeliveryError('');
        }
    };

    const handleCustomerHistoryClick = async order => {
        setCustomerHistoryOpen(true);
        setCustomerHistoryLoading(true);
        setCustomerHistoryError('');
        try {
            const firstResponse = await getCustomerOrders(order.customerId, 1, 100);
            const firstPayload = firstResponse?.data?.data ?? firstResponse?.data ?? {};
            const results = Array.isArray(firstPayload?.data) ? [...firstPayload.data] : Array.isArray(firstPayload) ? [...firstPayload] : [];
            const pages = Math.ceil(Number(firstPayload?.totalRecords || results.length) / 100);
            for (let page = 2; page <= pages; page++) {
                const response = await getCustomerOrders(order.customerId, page, 100);
                const payload = response?.data?.data ?? response?.data ?? {};
                results.push(...(Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []));
            }
            setCustomerHistory(results);
        } catch (historyError) {
            setCustomerHistoryError(historyError.message || 'Could not load customer order history.');
            setCustomerHistory([]);
        } finally { setCustomerHistoryLoading(false); }
    };

    const submitDelivery = async () => {
        if (!selectedOrder || deliveryIds.length === 0) { setDeliveryError('Select at least one packed suborder.'); return; }
        const maxBalance = Math.max(0, Number(selectedOrder.balanceAmount ?? selectedOrder.balanceDue ?? 0));
        const amount = Number(deliveryPayment.amount || 0);
        if (amount < 0 || amount > maxBalance) { setDeliveryError(`Payment must be between 0 and ${formatAmount(maxBalance)}.`); return; }
        setDeliverySaving(true);
        setDeliveryError('');
        try {
            await deliverSubOrders(selectedOrder.id, {
                orderDetailIds: deliveryIds,
                paymentAmount: amount,
                paymentMode: deliveryPayment.mode,
                paymentReference: deliveryPayment.reference,
                remarks: 'Payment at delivery'
            });
            fetchOrders(query, pageNo, pageSize);
            closeDetailModal();
        } catch (deliveryFailure) {
            setDeliveryError(deliveryFailure.message || 'Could not complete delivery.');
        } finally { setDeliverySaving(false); }
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
        setDetailError("");
        setActiveModalType("view");
        setPaymentDraft({ amount: "", method: "Cash", note: "" });
    };

    const handlePaymentSubmit = () => {
        if (!selectedOrder) return;

        const amount = Number(paymentDraft.amount || 0);
        if (!amount || amount <= 0) return;

        const newPayment = {
            id: Date.now(),
            amount,
            method: paymentDraft.method || "Cash",
            date: new Date().toISOString(),
            note: paymentDraft.note || "Manual payment"
        };

        const updatedOrder = {
            ...selectedOrder,
            paymentHistory: [...getOrderPaymentHistory(selectedOrder), newPayment],
            advanceAmount: Number(selectedOrder.advanceAmount || 0) + amount,
            totalInvoiced: Number(selectedOrder.totalInvoiced || selectedOrder.totalAmount || 0)
        };

        setSelectedOrder(updatedOrder);
        setPaymentDraft({ amount: "", method: "Cash", note: "" });
    };

    const handleMeasurementUpdate = (itemId, field, value) => {
        if (!selectedOrder?.orderDetails) return;

        setSelectedOrder(prev => ({
            ...prev,
            orderDetails: (prev.orderDetails || []).map(item => {
                if (!item || item.id !== itemId) return item;

                const nextMeasurement = {
                    ...(item.measurement || {}),
                    [field]: value
                };

                return { ...item, measurement: nextMeasurement };
            })
        }));
    };

    const renderModalBody = () => {
        if (detailError) return <div className="so-modal__error">{detailError}</div>;
        if (!selectedOrder) return null;

        if (activeModalType === "payment") {
            return <PaymentPopup order={selectedOrder} onClose={closeDetailModal} onSaved={order => setSelectedOrder(order)} />;
        }

        if (activeModalType === "measurement") {
            return <MeasurementPopup order={selectedOrder} onClose={closeDetailModal} onSaved={order => setSelectedOrder(order)} />;
        }

        if (activeModalType === "status") {
            return <StatusPopup order={selectedOrder} onClose={closeDetailModal} onSaved={order => setSelectedOrder(order)} />;
        }

        if (activeModalType === 'deliver') {
            const packedItems = selectedOrder.orderDetails || [];
            const maxBalance = Math.max(0, Number(selectedOrder.balanceAmount ?? selectedOrder.balanceDue ?? 0));
            return <div className="so-modal__content so-delivery-popup">
                <div className="so-delivery-summary"><div><span>Order</span><strong>{selectedOrder.orderNo}</strong></div><div><span>Remaining balance</span><strong>AED {formatAmount(maxBalance)}</strong></div></div>
                <h3><FiTruck /> Select packed suborders to deliver</h3>
                <div className="so-delivery-items">{packedItems.map(item => { const isPacked = normalizeStatus(item.statusStr || item.status) === 'packing'; return <label key={item.id} className={`so-delivery-item ${isPacked ? '' : 'is-unavailable'}`}>
                    <input type="checkbox" disabled={!isPacked} checked={deliveryIds.includes(item.id)} onChange={event => setDeliveryIds(ids => event.target.checked ? [...ids, item.id] : ids.filter(id => id !== item.id))} />
                    <span><strong>{item.orderNo}</strong><small>{item.statusStr || item.status} · AED {formatAmount(item.totalAmount)}{isPacked ? ' · Ready to deliver' : ' · Must be packed before delivery'}</small></span>
                </label>;})}</div>
                <div className="so-delivery-payment"><label>Payment received (optional)<input type="number" min="0" max={maxBalance} step="0.01" value={deliveryPayment.amount} onChange={event => setDeliveryPayment(value => ({ ...value, amount: event.target.value }))} placeholder={`Max AED ${formatAmount(maxBalance)}`} /></label>
                    <label>Payment method<select value={deliveryPayment.mode} onChange={event => setDeliveryPayment(value => ({ ...value, mode: event.target.value }))}><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>VISA</option></select></label>
                    <label>Reference<input value={deliveryPayment.reference} onChange={event => setDeliveryPayment(value => ({ ...value, reference: event.target.value }))} placeholder="Optional receipt/reference" /></label>
                </div>
                {deliveryError && <div className="so-delivery-error" role="alert">{deliveryError}</div>}
                <div className="so-delivery-actions"><button type="button" onClick={closeDetailModal} disabled={deliverySaving}>Cancel</button><button type="button" onClick={submitDelivery} disabled={deliverySaving || !deliveryIds.length}>{deliverySaving ? 'Saving…' : 'Confirm Delivery'}</button></div>
            </div>;
        }

        if (activeModalType === "print") {
            return <InvoicePrintPopup orderId={selectedOrder?.id} isOpen={isDetailModalOpen} onClose={closeDetailModal} />;
        }

        return (
            <div className="so-modal__content payment-popup so-order-detail-popup">
                <div className="so-modal__summary">
                    <div className="so-modal__group pp-summary-item pp-summary-item--customer">
                        <FiUser className="pp-summary-item__icon" />
                        <span>Customer</span>
                        <strong>{selectedOrder.customerName || "-"}</strong>
                    </div>
                    <div className="so-modal__group pp-summary-item pp-summary-item--customer">
                        <FiPhone className="pp-summary-item__icon" />
                        <span>Phone</span>
                        <strong>{selectedOrder.customerNumber || selectedOrder.phone || "-"}</strong>
                    </div>
                    <div className="so-modal__group pp-summary-item pp-summary-item--customer">
                        <FiActivity className="pp-summary-item__icon" />
                        <span>Status</span>
                        <strong>{getStatusLabel(selectedOrder.status)}</strong>
                    </div>
                    <div className="so-modal__group pp-summary-item pp-summary-item--customer">
                        <FiMapPin className="pp-summary-item__icon" />
                        <span>City</span>
                        <strong>{selectedOrder.city || "-"}</strong>
                    </div>
                </div>

                <div className="so-modal__metrics">
                    <div className="so-modal__metric pp-summary-item pp-summary-item--total">
                        <FiDollarSign className="pp-summary-item__icon" />
                        <span>Total Amount</span>
                        <strong>₹{formatAmount(selectedOrder.totalAmount ?? selectedOrder.totalInvoiced)}</strong>
                    </div>
                    <div className="so-modal__metric pp-summary-item pp-summary-item--settled">
                        <FiCreditCard className="pp-summary-item__icon" />
                        <span>Advance</span>
                        <strong>₹{formatAmount(selectedOrder.advanceAmount)}</strong>
                    </div>
                    <div className="so-modal__metric pp-summary-item pp-summary-item--due">
                        <FiDollarSign className="pp-summary-item__icon" />
                        <span>Balance</span>
                        <strong>₹{formatAmount(selectedOrder.balanceAmount)}</strong>
                    </div>
                    <div className="so-modal__metric pp-summary-item pp-summary-item--order">
                        <FiClipboard className="pp-summary-item__icon" />
                        <span>Booking Type</span>
                        <strong>{selectedOrder.bookingType || "-"}</strong>
                    </div>
                </div>

                <div className="so-modal__section">
                    <h3><FiClipboard /> Order Information</h3>
                    <div className="so-modal__grid">
                        <div><span>Order No</span><strong>{selectedOrder.orderNo || selectedOrder.id || "-"}</strong></div>
                        <div><span>Order Date</span><strong>{formatDate(selectedOrder.orderDate)}</strong></div>
                        <div><span>Delivery Date</span><strong>{formatDate(selectedOrder.deliveryDate)}</strong></div>
                        <div><span>Urgency</span><strong>{selectedOrder.urgency || "-"}</strong></div>
                        <div><span>Payment</span><strong>{selectedOrder.paymentMode || "-"}</strong></div>
                        <div><span>VAT</span><strong>{formatAmount(selectedOrder.vatAmount)} ({selectedOrder.vat || 0}%)</strong></div>
                    </div>
                </div>

                <div className="so-modal__section">
                    <h3><FiPackage /> Order Items</h3>
                    {(selectedOrder.orderDetails || []).length > 0 ? (
                        <div className="so-modal__items">
                            {selectedOrder.orderDetails.map((item) => (
                                <div key={item.id ?? `${selectedOrder.id}-${item.orderNo || Math.random()}`} className="so-modal__item">
                                    <div className="so-modal__item-header">
                                        <strong>{item.orderNo || `Item ${item.id}`}</strong>
                                        <span>{item.status || "Active"}</span>
                                    </div>
                                    <p>{item.description || "No description provided."}</p>
                                    <div className="so-modal__item-grid">
                                        <div><span>Crystal Packets</span><strong>{item.crystalPackets ?? 0}</strong></div>
                                        <div><span>Subtotal</span><strong>₹{formatAmount(item.subtotalAmount)}</strong></div>
                                        <div><span>VAT</span><strong>₹{formatAmount(item.vatAmount)}</strong></div>
                                        <div><span>Total</span><strong>₹{formatAmount(item.totalAmount)}</strong></div>
                                    </div>
                                    {item.workTypes && item.workTypes.length > 0 && (
                                        <div className="so-modal__tags">
                                            {item.workTypes.map((workType, index) => (
                                                <span key={`${item.id}-${workType.name || index}`} className="so-modal__tag">
                                                    {workType.name || "Work Type"}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="so-modal__empty">No order items available.</div>
                    )}
                </div>
            </div>
        );
    };

    const modalTitle = {
        view: selectedOrder ? `Order Details - ${selectedOrder.orderNo || selectedOrder.id}` : 'Order Details',
        payment: selectedOrder ? `Payment - ${selectedOrder.orderNo || selectedOrder.id}` : 'Payment',
        measurement: selectedOrder ? `Measurement - ${selectedOrder.orderNo || selectedOrder.id}` : 'Measurement',
        status: selectedOrder ? `Status - ${selectedOrder.orderNo || selectedOrder.id}` : 'Status',
        deliver: selectedOrder ? `Deliver - ${selectedOrder.orderNo || selectedOrder.id}` : 'Deliver Order',
        print: selectedOrder ? `Print Invoice - ${selectedOrder.orderNo || selectedOrder.id}` : 'Print Invoice'
    }[activeModalType] || 'Order Details';

    const filterPlaceholder = {
        all: "Search orders...",
        orderNo: "Search by order number...",
        customer: "Search by customer name...",
        phone: "Search by phone number..."
    }[activeFilter];

    return (
        <>
            <div className="so-root">
            <div className="so-header">
                <button
                    type="button"
                    className="so-back-btn"
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft size={18} />
                </button>

                <div className="so-header__icon">
                    <FiSearch size={20} />
                </div>

                <h1 className="so-header__title">
                    Search Orders
                </h1>
            </div>

            <div className="so-body">
                <div className="so-search-toolbar">
                    <div className="so-search-wrap">
                        <FiSearch
                            className="so-search-icon"
                            size={16}
                        />

                        <input
                            className="so-search-input"
                            type="text"
                            placeholder={filterPlaceholder}
                            value={query}
                            onChange={event =>
                                setQuery(event.target.value)
                            }
                        />
                    </div>

                    <div className="so-inline-actions">
                        <button
                            type="button"
                            className="so-action-icon-btn"
                            onClick={handleClearSearch}
                        >
                            <FiX size={15} />
                            Clear
                        </button>

                        <button
                            type="button"
                            className="so-action-icon-btn so-action-icon-btn--primary"
                            onClick={handleReload}
                        >
                            <FiRefreshCw size={15} />
                            Reload
                        </button>
                    </div>
                </div>

                <div className="so-toolbar">
                    <div className="so-filters">
                        {FILTERS.map(filter => {
                            const Icon = filter.icon;

                            return (
                                <button
                                    type="button"
                                    key={filter.id}
                                    className={`so-filter-btn ${activeFilter === filter.id
                                            ? "so-filter-btn--active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        handleFilterChange(filter.id)
                                    }
                                >
                                    <Icon size={14} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    <Pagination
                        currentPage={pageNo}
                        totalPages={Math.max(1, Math.ceil(totalRecords / pageSize))}
                        totalRecords={totalRecords}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                </div>

                <div className="so-results">
                    {loading && (
                        <div className="so-state">
                            <div className="so-spinner" />
                            <span>Searching...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="so-state so-state--error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        orders.length === 0 && (
                            <div className="so-state">
                                No orders found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onViewClick={handleOrderClick}
                                onActionClick={handleActionClick}
                                onCustomerHistoryClick={handleCustomerHistoryClick}
                            />
                        ))}
                </div>
            </div>
        </div>

            <Modal
                isOpen={isDetailModalOpen && activeModalType !== 'print'}
                onClose={closeDetailModal}
                title={modalTitle}
                size="xlarge"
                className="so-modal"
                loading={detailLoading}
            >
                {activeModalType === 'print' ? null : renderModalBody()}
            </Modal>

            {activeModalType === 'print' && selectedOrder && (
                <InvoicePrintPopup
                    orderId={selectedOrder.id}
                    isOpen={isDetailModalOpen}
                    onClose={closeDetailModal}
                />
            )}
            <Modal isOpen={customerHistoryOpen} onClose={() => setCustomerHistoryOpen(false)} title="Customer Balance & Order History" size="xlarge" className="so-modal">
                {customerHistoryLoading ? <div className="so-state"><div className="so-spinner" /><span>Loading customer orders…</span></div> : customerHistoryError ? <div className="so-modal__error">{customerHistoryError}</div> : <div className="so-customer-history">
                    <div className="so-customer-history__total"><span>Total customer balance</span><strong>AED {formatAmount(customerHistory.reduce((sum, item) => sum + Number(item.balanceDue || 0), 0))}</strong></div>
                    {customerHistory.map(order => <article className="so-customer-history__order" key={order.id}>
                        <header><strong>#{order.orderNo}</strong><span>{getStatusLabel(order.statusStr || order.status)}</span><b>Balance AED {formatAmount(order.balanceDue)}</b></header>
                        <small>{formatDate(order.orderDate)} · Total AED {formatAmount(order.totalInvoiced)} · Paid AED {formatAmount(order.totalPaid)}</small>
                        <div className="so-customer-history__items">{(order.orderDetails || []).map(item => <span key={item.id}>{item.orderNo}: {getStatusLabel(item.statusStr || item.status)} · AED {formatAmount(item.totalAmount)}</span>)}</div>
                    </article>)}
                    {!customerHistory.length && <div className="so-modal__empty">No customer orders found.</div>}
                </div>}
            </Modal>
        </>
    );
}

export default SearchOrders;
