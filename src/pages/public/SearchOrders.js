import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiFilter, FiHash,
  FiUser, FiPhone, FiCalendar, FiChevronRight, FiScissors,
} from 'react-icons/fi';
import { searchOrders } from '../../services/api/ordersApi';
import './SearchOrders.css';

// ── Constants ────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',      label: 'All',      icon: FiFilter },
  { id: 'orderNo',  label: 'Order No', icon: FiHash },
  { id: 'customer', label: 'Customer', icon: FiUser },
  { id: 'phone',    label: 'Phone',    icon: FiPhone },
];

const STATUS_META = {
  delivered:  { label: 'delivered',  cls: 'so-badge--delivered' },
  cancelled:  { label: 'cancelled',  cls: 'so-badge--cancelled' },
  pending:    { label: 'pending',    cls: 'so-badge--pending' },
  processing: { label: 'processing', cls: 'so-badge--processing' },
  completed:  { label: 'completed',  cls: 'so-badge--completed' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Order card ───────────────────────────────────────────────────
function OrderCard({ order, onClick }) {
  const status = (order.status || '').toLowerCase();
  const meta = STATUS_META[status] || { label: status, cls: 'so-badge--default' };

  return (
    <div className="so-card" onClick={() => onClick(order)}>
      <div className="so-card__icon">
        <FiScissors size={20} />
      </div>
      <div className="so-card__body">
        <div className="so-card__row1">
          <span className="so-card__orderno">{order.orderNo ?? order.id}</span>
          <span className={`so-badge ${meta.cls}`}>{meta.label}</span>
        </div>
        <div className="so-card__name">{order.customerName}</div>
        <div className="so-card__meta">
          {order.phone && (
            <span className="so-card__meta-item">
              <FiPhone size={12} />
              {order.phone}
            </span>
          )}
          {order.deliveryDate && (
            <span className="so-card__meta-item">
              <FiCalendar size={12} />
              {formatDate(order.deliveryDate)}
            </span>
          )}
        </div>
      </div>
      <FiChevronRight className="so-card__arrow" size={18} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
function SearchOrders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const fetchOrders = useCallback((q, filter) => {
    setLoading(true);
    setError('');
    const params = { pageNo: 1, pageSize: 50 };
    if (q) {
      if (filter === 'orderNo')  params.orderNo  = q;
      else if (filter === 'customer') params.customerName = q;
      else if (filter === 'phone')    params.phone = q;
      else                             params.query = q;
    }
    searchOrders(params)
      .then(res => setOrders(Array.isArray(res.data) ? res.data : (res.data?.items ?? [])))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => { fetchOrders('', 'all'); }, [fetchOrders]);

  // Debounced search on query/filter change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrders(query, activeFilter), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeFilter, fetchOrders]);

  const handleFilterChange = (id) => {
    setActiveFilter(id);
    setQuery('');
  };

  const handleOrderClick = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const filterPlaceholder = {
    all:      'Search orders...',
    orderNo:  'Search by order number...',
    customer: 'Search by customer name...',
    phone:    'Search by phone number...',
  }[activeFilter];

  return (
    <div className="so-root">
      {/* Page header */}
      <div className="so-header">
        <button className="so-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <div className="so-header__icon">
          <FiSearch size={20} />
        </div>
        <h1 className="so-header__title">Search Orders</h1>
      </div>

      <div className="so-body">
        {/* Search input */}
        <div className="so-search-wrap">
          <FiSearch className="so-search-icon" size={16} />
          <input
            className="so-search-input"
            type="text"
            placeholder={filterPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="so-filters">
          {FILTERS.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                className={`so-filter-btn ${activeFilter === f.id ? 'so-filter-btn--active' : ''}`}
                onClick={() => handleFilterChange(f.id)}
              >
                <Icon size={14} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="so-results">
          {loading && (
            <div className="so-state">
              <div className="so-spinner" />
              <span>Searching...</span>
            </div>
          )}
          {!loading && error && (
            <div className="so-state so-state--error">{error}</div>
          )}
          {!loading && !error && orders.length === 0 && (
            <div className="so-state">No orders found.</div>
          )}
          {!loading && !error && orders.map(order => (
            <OrderCard key={order.id} order={order} onClick={handleOrderClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchOrders;
