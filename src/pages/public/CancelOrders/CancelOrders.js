import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle, FiArrowLeft, FiCheckSquare, FiChevronLeft, FiChevronRight,
  FiClock, FiEye, FiEyeOff, FiLoader, FiSearch, FiSlash, FiUser, FiXSquare,
} from 'react-icons/fi';
import { useNotification } from '../../../components/Notification';
import Modal from '../../../components/Modal/Modal';
import { cancelOrderItem, getOrderById, getOrders } from '../../../services/api/ordersApi';
import './CancelOrders.css';

const PAGE_SIZE = 10;

const unwrapOrdersPage = response => {
  const envelope = response?.data && response.data.success !== undefined ? response.data : response;
  const payload = envelope?.data ?? envelope ?? {};
  return {
    orders: Array.isArray(payload.data) ? payload.data : [],
    totalRecords: Number(payload.totalRecords ?? 0),
  };
};

const unwrapOrder = response => {
  const envelope = response?.data && response.data.success !== undefined ? response.data : response;
  return envelope?.data ?? envelope ?? null;
};

const orderStatus = item => String(item?.statusStr ?? (typeof item?.status === 'string' ? item.status : '')).trim().toLowerCase();
const statusCode = item => {
  const rawCode = item?.statusCode ?? item?.statusId ?? (typeof item?.status === 'number' ? item.status : null);
  return rawCode === null || rawCode === undefined ? NaN : Number(rawCode);
};
const isActive = item => {
  const status = orderStatus(item);
  const code = statusCode(item);
  if (Number.isFinite(code)) return code === 1 && (!status || status === 'active');
  return status === 'active';
};
const isTerminal = item => ['cancelled', 'canceled', 'deleted'].includes(orderStatus(item)) || [8, 9].includes(statusCode(item));
const isCancelled = item => ['cancelled', 'canceled'].includes(orderStatus(item)) || statusCode(item) === 8;
const isSuborderDeleted = item => Boolean(item?.isDeleted) || orderStatus(item) === 'deleted' || statusCode(item) === 9;
const canCancelCompleteOrder = order => {
  const details = Array.isArray(order?.orderDetails) ? order.orderDetails : [];
  const active = details.filter(item => isActive(item) && !isSuborderDeleted(item));
  const live = details.filter(item => !isTerminal(item) && !isSuborderDeleted(item));
  return isActive(order) && active.length > 0 && live.every(isActive);
};

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB');
};

const money = value => Number(value || 0).toLocaleString('en-AE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function CancelOrders() {
  const navigate = useNavigate();
  const { confirm, success, error: showError } = useNotification();
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [orderCancellationStates, setOrderCancellationStates] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mode, setMode] = useState('order');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedSuborderId, setExpandedSuborderId] = useState(null);

  const loadOrders = useCallback(async () => {
    setListLoading(true);
    setListError('');
    setOrderCancellationStates({});
    try {
      const response = await getOrders(pageNo, PAGE_SIZE, query.trim());
      const page = unwrapOrdersPage(response);
      setOrders(page.orders);
      setTotalRecords(page.totalRecords);
      const cancellationStates = await Promise.all(page.orders.map(async order => {
        if (isCancelled(order)) return [order.id, 'cancelled'];
        try {
          const detail = unwrapOrder(await getOrderById(order.id));
          return [order.id, (detail?.orderDetails || []).some(isCancelled) ? 'partial' : ''];
        } catch {
          return [order.id, ''];
        }
      }));
      setOrderCancellationStates(Object.fromEntries(cancellationStates));
    } catch (requestError) {
      setOrders([]);
      setOrderCancellationStates({});
      setTotalRecords(0);
      setListError(requestError?.message || 'Could not load orders.');
    } finally {
      setListLoading(false);
    }
  }, [pageNo, query]);

  useEffect(() => {
    const timer = setTimeout(loadOrders, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, query]);

  const openOrder = async order => {
    setSelectedOrder(null);
    setSelectedItemIds([]);
    setReason('');
    setExpandedSuborderId(null);
    setMode('order');
    setDetailLoading(true);
    try {
      const response = await getOrderById(order.id);
      const detail = unwrapOrder(response);
      setSelectedOrder(detail);
      setMode(canCancelCompleteOrder(detail) ? 'order' : 'suborders');
    } catch (requestError) {
      showError(requestError?.message || 'Could not load order details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrder = () => {
    if (saving) return;
    setSelectedOrder(null);
    setExpandedSuborderId(null);
    setSelectedItemIds([]);
    setReason('');
  };

  const details = Array.isArray(selectedOrder?.orderDetails) ? selectedOrder.orderDetails : [];
  const activeSuborders = useMemo(() => details.filter(item => isActive(item) && !isSuborderDeleted(item)), [details]);
  const notTerminalSuborders = useMemo(() => details.filter(item => !isTerminal(item) && !isSuborderDeleted(item)), [details]);
  const orderIsActive = isActive(selectedOrder);
  const canCancelWholeOrder = orderIsActive && activeSuborders.length > 0 && notTerminalSuborders.every(isActive);
  const targetSuborders = mode === 'order'
    ? (canCancelWholeOrder ? activeSuborders : [])
    : activeSuborders.filter(item => selectedItemIds.includes(item.id));
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const toggleSuborder = itemId => {
    setSelectedItemIds(current => current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId]);
  };

  const handleCancel = async () => {
    if (!orderIsActive || !targetSuborders.length || !reason.trim() || saving) return;

    const targetLabel = mode === 'order'
      ? `the complete order ${selectedOrder.orderNo || selectedOrder.id}`
      : `${targetSuborders.length} selected suborder${targetSuborders.length === 1 ? '' : 's'} from order ${selectedOrder.orderNo || selectedOrder.id}`;
    const approved = await confirm({
      type: 'danger',
      title: 'Confirm order cancellation',
      message: `Cancel ${targetLabel}? This action cannot be undone.`,
      confirmText: 'Cancel order',
      cancelText: 'Keep order',
    });
    if (!approved) return;

    setSaving(true);
    let completed = 0;
    let cancellationError = null;
    try {
      for (const item of targetSuborders) {
        try {
          const response = await cancelOrderItem(item.id, { reason: reason.trim(), quantity: 1 });
          if (response?.success === false) throw new Error(response.message || `Could not cancel ${item.orderNo || 'suborder'}.`);
          completed += 1;
        } catch (requestError) {
          cancellationError = requestError;
          break;
        }
      }

      if (completed) {
        success(mode === 'order' ? 'Order cancelled.' : `${completed} suborder${completed === 1 ? '' : 's'} cancelled.`);
        setSelectedItemIds([]);
        setReason('');
      }
      if (cancellationError) {
        showError(completed
          ? `${completed} suborder${completed === 1 ? '' : 's'} cancelled; the next cancellation failed: ${cancellationError?.message || 'request failed'}`
          : cancellationError?.message || 'Cancellation failed.');
      }

      const refreshed = await Promise.allSettled([
        getOrderById(selectedOrder.id).then(unwrapOrder),
        loadOrders(),
      ]);
      if (refreshed[0].status === 'fulfilled') setSelectedOrder(refreshed[0].value);
      else if (completed) showError('Cancellation was saved, but the updated order could not be loaded.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cancel-page">
      <header className="cancel-header">
        <button type="button" className="cancel-header__back" onClick={() => navigate(-1)} aria-label="Go back"><FiArrowLeft /></button>
        <div className="cancel-header__icon"><FiSlash /></div>
        <div className="cancel-header__copy"><h1>Cancel Order</h1><p>Cancel an active order or selected active suborders</p></div>
      </header>

      <main className="cancel-content">
        <section className="cancel-list-panel">
          <div className="cancel-list-panel__top">
            <div><h2>Find an order</h2><p>Only active orders and active suborders can be cancelled.</p></div>
            <label className="cancel-search"><FiSearch /><input value={query} onChange={event => { setQuery(event.target.value); setPageNo(1); }} placeholder="Order no, customer, or phone" /></label>
          </div>
          <div className="cancel-legend"><span><i className="cancel-legend__red" />Fully cancelled</span><span><i className="cancel-legend__orange" />Has cancelled suborders</span></div>

          {listError && <div className="cancel-state cancel-state--error"><FiAlertCircle /> {listError}<button type="button" onClick={loadOrders}>Retry</button></div>}
          {!listError && listLoading && <div className="cancel-state"><span className="cancel-spinner" /> Loading orders…</div>}
          {!listError && !listLoading && orders.length === 0 && <div className="cancel-state"><FiSearch /> No orders found.</div>}

          {!listError && !listLoading && orders.length > 0 && <div className="cancel-order-list">
            {orders.map(order => {
              const active = isActive(order);
              const cancellationState = isCancelled(order) ? 'cancelled' : orderCancellationStates[order.id] || (statusCode(order) === 10 ? 'partial' : '');
              return <article className={`cancel-order-row ${cancellationState ? `cancel-order-row--${cancellationState}` : ''}`} key={order.id}>
                <div className="cancel-order-row__main">
                  <div className="cancel-order-row__title"><strong>#{order.orderNo || order.id}</strong><span className={`cancel-status ${cancellationState ? `cancel-status--${cancellationState}` : active ? 'cancel-status--active' : 'cancel-status--inactive'}`}>{order.statusStr || order.status || 'Unknown'}</span></div>
                  <div className="cancel-order-row__customer"><FiUser /> {order.customerName || 'Customer'}{order.customerNumber ? <span>· {order.customerNumber}</span> : null}</div>
                  <div className="cancel-order-row__meta"><span><FiClock /> {formatDate(order.orderDate)}</span><span>{order.totalItems ?? order.qty ?? 0} suborders</span><span>AED {money(order.totalAmount ?? order.totalInvoiced)}</span></div>
                </div>
                <button type="button" className="cancel-review-btn" onClick={() => openOrder(order)} disabled={detailLoading}>{detailLoading ? <FiLoader /> : <FiChevronRight />} Review</button>
              </article>;
            })}
          </div>}

          {totalRecords > 0 && <footer className="cancel-pagination">
            <span>Showing {Math.min((pageNo - 1) * PAGE_SIZE + 1, totalRecords)}–{Math.min(pageNo * PAGE_SIZE, totalRecords)} of {totalRecords}</span>
            <div><button type="button" aria-label="Previous page" disabled={pageNo <= 1 || listLoading} onClick={() => setPageNo(page => page - 1)}><FiChevronLeft /></button><span>{pageNo} / {totalPages}</span><button type="button" aria-label="Next page" disabled={pageNo >= totalPages || listLoading} onClick={() => setPageNo(page => page + 1)}><FiChevronRight /></button></div>
          </footer>}
        </section>

        <Modal isOpen={detailLoading || Boolean(selectedOrder)} onClose={closeOrder} title="Review order cancellation" icon={<FiSlash />} size="large" className="cancel-order-modal" loading={detailLoading} closeOnOverlayClick={!saving} closeOnEscape={!saving} showCloseButton={!saving}>
        {selectedOrder && <section className="cancel-detail-panel">
          <div className="cancel-detail-panel__heading">
            <div><span className="cancel-eyebrow">Order #{selectedOrder.orderNo || selectedOrder.id}</span><h2>{selectedOrder.customerName || 'Customer'}</h2><p>{selectedOrder.customerNumber || selectedOrder.phone || 'No phone number'} · {formatDate(selectedOrder.orderDate)}</p></div>
            <span className={`cancel-status ${isCancelled(selectedOrder) ? 'cancel-status--cancelled' : statusCode(selectedOrder) === 10 ? 'cancel-status--partial' : orderIsActive ? 'cancel-status--active' : 'cancel-status--inactive'}`}>{selectedOrder.status || selectedOrder.statusStr || 'Unknown'}</span>
          </div>

          {(selectedOrder.cancellationDate || selectedOrder.cancellationReason) && <div className="cancel-order-cancellation">
            <strong>{isCancelled(selectedOrder) ? 'Order cancellation' : 'Suborder cancellation summary'}</strong>
            <dl>
              {selectedOrder.cancellationDate && <div><dt>Cancelled on</dt><dd>{formatDate(selectedOrder.cancellationDate)}</dd></div>}
              {selectedOrder.cancellationReason && <div><dt>Reason</dt><dd>{selectedOrder.cancellationReason}</dd></div>}
            </dl>
          </div>}

          {!orderIsActive && <div className="cancel-notice cancel-notice--blocked"><FiAlertCircle /><span>This order is not active, so it cannot be cancelled.</span></div>}
          {orderIsActive && activeSuborders.length === 0 && <div className="cancel-notice cancel-notice--blocked"><FiAlertCircle /><span>This order has no active suborders to cancel.</span></div>}

          {orderIsActive && activeSuborders.length > 0 && (
            <div className="cancel-mode-options">
              <label className={`cancel-mode-option ${mode === 'order' ? 'is-selected' : ''} ${!canCancelWholeOrder ? 'is-disabled' : ''}`}>
                <input type="radio" name="cancel-mode" value="order" checked={mode === 'order'} disabled={!canCancelWholeOrder || saving} onChange={() => { setMode('order'); setSelectedItemIds([]); }} />
                <span><strong>Cancel complete order</strong><small>{canCancelWholeOrder ? `Cancel all ${activeSuborders.length} active suborders.` : 'Unavailable because the order contains a non-active suborder.'}</small></span>
              </label>
              <label className={`cancel-mode-option ${mode === 'suborders' ? 'is-selected' : ''}`}>
                <input type="radio" name="cancel-mode" value="suborders" checked={mode === 'suborders'} disabled={saving} onChange={() => setMode('suborders')} />
                <span><strong>Choose suborders</strong><small>Select one or more active suborders to cancel.</small></span>
              </label>
            </div>
          )}

          {details.length > 0 && <div className="cancel-suborders-heading"><div><h3>Suborders</h3><span>{activeSuborders.length} active · {details.length - activeSuborders.length} inactive</span></div><small>Review details or select active items to cancel.</small></div>}
          <div className="cancel-suborder-list">
            {details.map((item, index) => {
              const active = isActive(item) && !isSuborderDeleted(item);
              const checked = mode === 'order' ? canCancelWholeOrder : selectedItemIds.includes(item.id);
              const cancelled = isCancelled(item);
              const expanded = expandedSuborderId === item.id;
              const workTypes = Array.isArray(item.workTypes) ? item.workTypes : [];
              const history = Array.isArray(item.orderStatusHistory) ? item.orderStatusHistory : [];
              return <article key={item.id || index} className={`cancel-suborder-wrap ${cancelled ? 'cancel-suborder-wrap--cancelled' : ''}`}>
                <div className={`cancel-suborder ${active ? 'cancel-suborder--selectable' : 'cancel-suborder--locked'} ${checked && active ? 'is-selected' : ''}`}>
                  {active && orderIsActive ? <input aria-label={`Select ${item.orderNo || `suborder ${index + 1}`} for cancellation`} type="checkbox" checked={Boolean(checked)} disabled={mode === 'order' || saving} onChange={() => toggleSuborder(item.id)} /> : <span className="cancel-suborder__check">{cancelled ? <FiXSquare /> : <FiCheckSquare />}</span>}
                  <span className="cancel-suborder__body"><strong>{item.orderNo || `Suborder ${index + 1}`}</strong><small>{item.description || 'No description'} · AED {money(item.totalAmount ?? item.subtotalAmount)}</small></span>
                  <span className={`cancel-status ${cancelled ? 'cancel-status--cancelled' : active ? 'cancel-status--active' : 'cancel-status--inactive'}`}>{item.status || item.statusStr || 'Unknown'}</span>
                  <button type="button" className="cancel-suborder__details" aria-expanded={expanded} onClick={() => setExpandedSuborderId(expanded ? null : item.id)}><span>{expanded ? <FiEyeOff /> : <FiEye />}</span>{expanded ? 'Hide details' : 'View details'}</button>
                </div>
                {expanded && <div className="cancel-suborder-details">
                  <dl><div><dt>Suborder</dt><dd>{item.orderNo || '—'}</dd></div><div><dt>Status</dt><dd>{item.status || item.statusStr || 'Unknown'}</dd></div><div><dt>Delivery</dt><dd>{formatDate(item.deliveryDate)}</dd></div><div><dt>Subtotal</dt><dd>AED {money(item.subtotalAmount)}</dd></div><div><dt>VAT</dt><dd>AED {money(item.vatAmount)}</dd></div><div><dt>Total</dt><dd>AED {money(item.totalAmount)}</dd></div><div><dt>Crystal packets</dt><dd>{item.crystalPackets ?? 0}</dd></div><div><dt>Note</dt><dd>{item.note || '—'}</dd></div></dl>
                  {workTypes.length > 0 && <div className="cancel-suborder-details__section"><strong>Work types</strong><ul>{workTypes.map((work, workIndex) => <li key={work.id || workIndex}>{work.workTypeName || work.name || work.workType || 'Work type'}{work.status ? ` · ${work.status}` : ''}</li>)}</ul></div>}
                  {cancelled && <dl className="cancel-suborder-details__cancellation">{item.cancelledDate && <div><dt>Cancelled on</dt><dd>{formatDate(item.cancelledDate)}</dd></div>}{item.cancelledReason && <div><dt>Cancellation reason</dt><dd>{item.cancelledReason}</dd></div>}</dl>}
                  {item.measurement && <div className="cancel-suborder-details__section"><strong>Measurement</strong><dl>{Object.entries(item.measurement).filter(([, value]) => value !== null && value !== '' && typeof value !== 'object').map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1')}</dt><dd>{String(value)}</dd></div>)}</dl></div>}
                  {history.length > 0 && <div className="cancel-suborder-details__section"><strong>Status history</strong><ul>{history.map((entry, historyIndex) => <li key={entry.id || historyIndex}>{entry.status || entry.statusStr || 'Status updated'}{entry.createdAt || entry.changedAt ? ` · ${formatDate(entry.createdAt || entry.changedAt)}` : ''}{entry.note || entry.reason ? ` · ${entry.note || entry.reason}` : ''}</li>)}</ul></div>}
                </div>}
              </article>;
            })}
          </div>
          {orderIsActive && activeSuborders.length > 0 && <div className="cancel-action-box">
            <label className="cancel-reason"><span>Reason for cancellation <b>*</b></span><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} placeholder="Enter why this order or its selected suborders are being cancelled" disabled={saving} /></label>
            <div className="cancel-submit-row"><span>{targetSuborders.length} active suborder{targetSuborders.length === 1 ? '' : 's'} selected</span><button type="button" className="cancel-submit-btn" onClick={handleCancel} disabled={!targetSuborders.length || !reason.trim() || saving}><FiSlash /> {saving ? 'Cancelling…' : mode === 'order' ? 'Cancel complete order' : `Cancel ${targetSuborders.length || ''} suborder${targetSuborders.length === 1 ? '' : 's'}`}</button></div>
          </div>}
        </section>}
        </Modal>
      </main>
    </div>
  );
}

export default CancelOrders;
