import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiChevronLeft, FiChevronRight, FiDollarSign,
  FiCalendar, FiCreditCard, FiPhone, FiSearch, FiUser,
} from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
import { useNotification } from '../../../components/Notification';
import { getOrders } from '../../../services/api/ordersApi';
import PaymentPopup from '../PaymentPopup';
import '../SearchOrders.css';
import './Advances.css';

const PAGE_SIZE = 10;

const formatAmount = value => Number(value || 0).toLocaleString('en-AE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-AE');
};

function Advances() {
  const navigate = useNavigate();
  const { error: showError } = useNotification();
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const debounceRef = useRef(null);

  const fetchOrders = useCallback(async (search, page) => {
    setLoading(true);
    try {
      const response = await getOrders(page, PAGE_SIZE, search.trim());
      const payload = response?.data?.data ? response.data : response?.data;
      const data = Array.isArray(payload?.data) ? payload.data : [];
      setOrders(data);
      setTotalRecords(Number(payload?.totalRecords || 0));
    } catch (err) {
      setOrders([]);
      setTotalRecords(0);
      showError(err.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrders(query, pageNo), query ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [query, pageNo, fetchOrders]);

  const handleSearch = value => {
    setQuery(value);
    setPageNo(1);
  };

  const openPayments = order => {
    setSelectedOrder(order);
  };

  const handlePaymentSaved = order => {
    setSelectedOrder(order);
    fetchOrders(query, pageNo);
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  return (
    <div className="adv-page">
      <header className="adv-header">
        <button type="button" className="adv-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FiArrowLeft size={18} />
        </button>
        <div className="adv-header__icon"><FiDollarSign size={20} /></div>
        <div className="adv-header__title-wrap">
          <h1>Order Advances</h1>
          <p>Record an advance payment against an order</p>
        </div>
      </header>

      <main className="adv-content">
        <label className="adv-search">
          <FiSearch size={17} />
          <input
            value={query}
            onChange={event => handleSearch(event.target.value)}
            placeholder="Search by order number, customer, or mobile"
            aria-label="Search orders"
          />
        </label>

        <section className="adv-list" aria-live="polite">
          {loading ? (
            <div className="adv-state"><span className="adv-spinner" /> Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="adv-state">
              <FiDollarSign size={30} />
              <p>{query ? 'No matching orders found.' : 'No orders found.'}</p>
            </div>
          ) : orders.map(order => {
            const balance = Number(order.balanceDue ?? order.balanceAmount ?? 0);
            const total = Number(order.totalInvoiced ?? order.totalAmount ?? 0);
            const paid = Number(order.totalPaid ?? order.advanceAmount ?? 0);
            return (
              <article className="adv-order" key={order.id}>
                <div className="adv-order__main">
                  <div className="adv-order__heading">
                    <span className="adv-order__number">{order.orderNo || `Order #${order.id}`}</span>
                    <span className={`adv-status ${balance > 0 ? 'adv-status--due' : 'adv-status--paid'}`}>
                      {balance > 0 ? 'Balance due' : 'Paid'}
                    </span>
                  </div>
                  <div className="adv-order__customer">
                    <span><FiUser size={13} /> {order.customerName || 'Customer'}</span>
                    {order.customerNumber && <span><FiPhone size={13} /> {order.customerNumber}</span>}
                  </div>
                  <div className="adv-order__meta">
                    <span className="adv-meta-item adv-meta-item--date">
                      <FiCalendar size={14} aria-hidden="true" />
                      <span className="adv-meta-item__content"><small>Order date</small><strong>{formatDate(order.orderDate)}</strong></span>
                    </span>
                    <span className="adv-meta-item adv-meta-item--total">
                      <FiDollarSign size={14} aria-hidden="true" />
                      <span className="adv-meta-item__content"><small>Total</small><strong>AED {formatAmount(total)}</strong></span>
                    </span>
                    <span className="adv-meta-item adv-meta-item--paid">
                      <FiCreditCard size={14} aria-hidden="true" />
                      <span className="adv-meta-item__content"><small>Paid</small><strong>AED {formatAmount(paid)}</strong></span>
                    </span>
                    <span className={`adv-meta-item adv-meta-item--balance ${balance > 0 ? 'is-due' : 'is-settled'}`}>
                      <FiDollarSign size={14} aria-hidden="true" />
                      <span className="adv-meta-item__content"><small>Balance</small><strong>AED {formatAmount(balance)}</strong></span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="adv-record-btn"
                  onClick={() => openPayments(order)}
                >
                  <FiDollarSign size={15} /> {balance > 0 ? 'Record advance' : 'Payment history'}
                </button>
              </article>
            );
          })}
        </section>

        {totalRecords > 0 && (
          <footer className="adv-pagination">
            <span>Showing {((pageNo - 1) * PAGE_SIZE) + 1}–{Math.min(pageNo * PAGE_SIZE, totalRecords)} of {totalRecords}</span>
            <div className="adv-pagination__controls">
              <button type="button" aria-label="Previous page" disabled={pageNo <= 1 || loading} onClick={() => setPageNo(page => page - 1)}><FiChevronLeft /></button>
              <span>{pageNo} / {totalPages}</span>
              <button type="button" aria-label="Next page" disabled={pageNo >= totalPages || loading} onClick={() => setPageNo(page => page + 1)}><FiChevronRight /></button>
            </div>
          </footer>
        )}
      </main>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Payment · ${selectedOrder?.orderNo || ''}`}
        size="large"
      >
        {selectedOrder && <PaymentPopup order={selectedOrder} onClose={() => setSelectedOrder(null)} onSaved={handlePaymentSaved} />}
      </Modal>
    </div>
  );
}

export default Advances;
