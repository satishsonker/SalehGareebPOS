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
    FiChevronRight,
    FiDollarSign,
    FiPackage
} from "react-icons/fi";
import { getOrders, getOrderById } from "../../services/api/ordersApi";
import Modal from "../../components/Modal/Modal";
import "./SearchOrders.css";

const FILTERS = [
    { id: "all", label: "All", icon: FiFilter },
    { id: "orderNo", label: "Order No", icon: FiHash },
    { id: "customer", label: "Customer", icon: FiUser },
    { id: "phone", label: "Phone", icon: FiPhone }
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
    if (isCancelled(normalized)) return "Cancelled";
    if (normalized === "active") return "Active";
    if (normalized === "processing") return "Processing";
    if (normalized === "completed") return "Completed";
    if (normalized === "packing") return "Packing";
    if (normalized === "delivered") return "Delivered";

    return "Active";
};

function OrderStatusTimeline({ status }) {
    const currentIndex = getStatusIndex(status);
    const cancelled = isCancelled(status);
    const partialDelivered = isPartialDelivered(status);

    return (
        <div className="so-timeline">
            {ORDER_STEPS.map((step, index) => {
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

                            <span>{step.label}</span>
                        </div>

                        {index < ORDER_STEPS.length - 1 && (
                            <div
                                className={`so-timeline__line ${index < currentIndex
                                        ? "so-timeline__line--completed"
                                        : ""
                                    }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {cancelled && (
                <div className="so-timeline__branch so-timeline__branch--cancelled">
                    Cancelled
                </div>
            )}

            {partialDelivered && (
                <div className="so-timeline__branch so-timeline__branch--partial">
                    Partial Delivered
                </div>
            )}
        </div>
    );
}

function OrderCard({ order, onViewClick }) {
    const status = normalizeStatus(order?.status);
    const statusLabel = getStatusLabel(order?.status);

    return (
        <div
            className="so-card"
            onClick={() => onViewClick(order)}
        >
            <div className="so-card__header">
                <div className="so-card__order">
                    <span>ORDER NO.</span>
                    <strong>
                        {order?.orderNo ?? order?.id ?? "-"}
                    </strong>
                </div>

                <div
                    className={`so-card__status so-card__status--${status.replace(
                        /\s+/g,
                        "-"
                    )}`}
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
                <OrderStatusTimeline status={status} />

                <button
                    type="button"
                    className="so-view-btn"
                    onClick={event => {
                        event.stopPropagation();
                        onViewClick(order);
                    }}
                >
                    View
                    <FiChevronRight size={15} />
                </button>
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
    const debounceRef = useRef(null);

    const fetchOrders = useCallback((q) => {
        setLoading(true);
        setError("");

        getOrders(1, 100, q)
            .then(res => {
                const orderList = res?.data?.data ?? [];
                setOrders(orderList);
            })
            .catch(() => setError('Failed to load orders.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchOrders(query);
    }, [fetchOrders]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchOrders(query, activeFilter);
        }, 650);

        return () => clearTimeout(debounceRef.current);
    }, [query, activeFilter, fetchOrders]);

    const handleFilterChange = id => {
        setActiveFilter(id);
        setQuery("");
    };

    const handleOrderClick = async (order) => {
        if (!order?.id) return;

        setDetailLoading(true);
        setDetailError("");

        try {
            const res = await getOrderById(order.id);
            const detail = res?.data?.data ?? res?.data ?? {};
            setSelectedOrder(detail);
            setIsDetailModalOpen(true);
        } catch {
            setDetailError('Failed to load order details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
        setDetailError("");
    };

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
                            />
                        ))}
                </div>
            </div>
        </div>

            <Modal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                title={selectedOrder ? `Order Details - ${selectedOrder.orderNo || selectedOrder.id}` : 'Order Details'}
                size="large"
                loading={detailLoading}
            >
                {detailError ? (
                    <div className="so-modal__error">{detailError}</div>
                ) : selectedOrder ? (
                    <div className="so-modal__content">
                        <div className="so-modal__summary">
                            <div className="so-modal__group">
                                <span>Customer</span>
                                <strong>{selectedOrder.customerName || "-"}</strong>
                            </div>
                            <div className="so-modal__group">
                                <span>Phone</span>
                                <strong>{selectedOrder.customerNumber || selectedOrder.phone || "-"}</strong>
                            </div>
                            <div className="so-modal__group">
                                <span>Status</span>
                                <strong>{getStatusLabel(selectedOrder.status)}</strong>
                            </div>
                            <div className="so-modal__group">
                                <span>City</span>
                                <strong>{selectedOrder.city || "-"}</strong>
                            </div>
                        </div>

                        <div className="so-modal__metrics">
                            <div className="so-modal__metric">
                                <span>Total Amount</span>
                                <strong>₹{formatAmount(selectedOrder.totalAmount ?? selectedOrder.totalInvoiced)}</strong>
                            </div>
                            <div className="so-modal__metric">
                                <span>Advance</span>
                                <strong>₹{formatAmount(selectedOrder.advanceAmount)}</strong>
                            </div>
                            <div className="so-modal__metric">
                                <span>Balance</span>
                                <strong>₹{formatAmount(selectedOrder.balanceAmount)}</strong>
                            </div>
                            <div className="so-modal__metric">
                                <span>Booking Type</span>
                                <strong>{selectedOrder.bookingType || "-"}</strong>
                            </div>
                        </div>

                        <div className="so-modal__section">
                            <h3>Order Information</h3>
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
                            <h3>Order Items</h3>
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
                ) : null}
            </Modal>
        </>
    );
}

export default SearchOrders;