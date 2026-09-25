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
import { getOrders } from "../../services/api/ordersApi";
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
                            className={`so-timeline__step ${
                                isCompleted
                                    ? "so-timeline__step--completed"
                                    : ""
                            } ${
                                isCurrent
                                    ? "so-timeline__step--current"
                                    : ""
                            } ${
                                cancelled && isCurrent
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
                                className={`so-timeline__line ${
                                    index < currentIndex
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

function OrderCard({ order, onClick }) {
    const status = normalizeStatus(order?.status);

    const statusLabel = isPartialDelivered(status)
        ? "Partial Delivered"
        : isCancelled(status)
          ? "Cancelled"
          : order?.status || "Active";

    return (
        <div
            className="so-card"
            onClick={() => onClick(order)}
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
                    {ORDER_STEPS[status-1].label}
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
                        onClick(order);
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
    const debounceRef = useRef(null);

    const fetchOrders = useCallback((q, filter) => {
        setLoading(true);
        setError("");

        getOrders(1, 100)
    .then(res => {
        const orderList = res?.data?.data ?? [];
        setOrders(orderList);
    })
    .catch(() => setError('Failed to load orders.'))
    .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchOrders("", "all");
    }, [fetchOrders]);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchOrders(query, activeFilter);
        }, 350);

        return () => clearTimeout(debounceRef.current);
    }, [query, activeFilter, fetchOrders]);

    const handleFilterChange = id => {
        setActiveFilter(id);
        setQuery("");
    };

    const handleOrderClick = order => {
        navigate(`/orders/${order.id}`);
    };

    const filterPlaceholder = {
        all: "Search orders...",
        orderNo: "Search by order number...",
        customer: "Search by customer name...",
        phone: "Search by phone number..."
    }[activeFilter];

    return (
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
                                className={`so-filter-btn ${
                                    activeFilter === filter.id
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
                                onClick={handleOrderClick}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

export default SearchOrders;