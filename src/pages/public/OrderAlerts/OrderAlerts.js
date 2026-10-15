import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle, FiArrowLeft, FiBarChart2, FiCalendar, FiCheckCircle,
  FiChevronLeft, FiChevronRight, FiFilter, FiPrinter, FiRefreshCw,
  FiSearch, FiXCircle,
} from 'react-icons/fi';
import { getOrderAlerts } from '../../../services/api/ordersApi';
import { getUsers } from '../../../services/api/usersApi';
import './OrderAlerts.css';

const DEFAULT_PAGE_SIZE = 20;
const ORDER_TYPES = ['Light', 'Normal', 'Urgent', 'Heavy'];
const PROCESS_COLUMNS = [
  { key: 'design', label: 'Designing' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'mEmb', label: 'M.EMB' },
  { key: 'hFix', label: 'H.Fix' },
  { key: 'hEmb', label: 'H.EMB' },
  { key: 'apliq', label: 'Apliq' },
  { key: 'stitch', label: 'Stitching' },
];

const localDateValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const unwrapList = response => {
  const data = response?.data?.data ?? response?.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : [];
};

const unwrapPage = response => {
  const envelope = response?.data && response.data.success !== undefined ? response.data : response;
  const payload = envelope?.data ?? envelope ?? {};
  return {
    rows: Array.isArray(payload?.data) ? payload.data : [],
    totalRecords: Number(payload?.totalRecords ?? 0),
  };
};

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const remainingDays = value => {
  if (!value) return null;
  const delivery = new Date(value);
  if (Number.isNaN(delivery.getTime())) return null;
  delivery.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((delivery.getTime() - today.getTime()) / 86400000);
};

const getProcessStatus = value => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') return getProcessStatus(value.status ?? value.statusName ?? value.name);
  if (typeof value === 'boolean') return value ? 'Completed' : 'Not Started';

  const normalized = String(value).trim().toLowerCase();
  if (['completed', 'complete', 'done', 'finished', '3'].includes(normalized)) return 'Completed';
  if (['in progress', 'in-progress', 'processing', 'started', '2'].includes(normalized)) return 'In Progress';
  if (['not started', 'pending', 'active', '0', '1'].includes(normalized)) return 'Not Started';
  return String(value);
};

const statusClass = value => {
  const status = getProcessStatus(value);
  if (!status) return 'oa-process--empty';
  if (status === 'Completed') return 'oa-process--complete';
  if (status === 'In Progress') return 'oa-process--progress';
  return 'oa-process--pending';
};

const salesmanLabel = user => user.fullName || user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email || `Salesman ${user.id}`;

function OrderAlerts() {
  const navigate = useNavigate();
  const today = localDateValue();
  const [filters, setFilters] = useState({
    orderType: '', salesmanId: '', fromDate: today, toDate: today, alertBeforeDays: 10,
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [salesmen, setSalesmen] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderAlerts({ ...filters, pageNo, pageSize });
      const page = unwrapPage(response);
      setRows(page.rows);
      setTotalRecords(page.totalRecords);
      setExpandedId(null);
    } catch (requestError) {
      setRows([]);
      setTotalRecords(0);
      setError(requestError?.message || 'Unable to load order alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, pageNo, pageSize]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  useEffect(() => {
    let active = true;
    getUsers(1, 200)
      .then(response => {
        if (!active) return;
        setSalesmen(unwrapList(response).filter(user => !user.isAdmin));
      })
      .catch(() => { if (active) setSalesmen([]); });
    return () => { active = false; };
  }, []);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = rows.filter(row => !query || [
      row.orderNo, row.subOrderNo, row.orderType, row.grade, row.description, row.status,
    ].some(value => String(value ?? '').toLowerCase().includes(query)));

    return [...filtered].sort((left, right) => {
      if (sortBy === 'deliveryDate') return new Date(left.deliveryDate || 0) - new Date(right.deliveryDate || 0);
      if (sortBy === 'orderNo') return String(left.orderNo || '').localeCompare(String(right.orderNo || ''));
      if (sortBy === 'remainingDays') return (remainingDays(left.deliveryDate) ?? Infinity) - (remainingDays(right.deliveryDate) ?? Infinity);
      return 0;
    });
  }, [rows, search, sortBy]);

  const processCounts = useMemo(() => PROCESS_COLUMNS.map(column => {
    const populated = rows.filter(row => getProcessStatus(row[column.key]));
    const completed = populated.filter(row => getProcessStatus(row[column.key]) === 'Completed').length;
    return { key: column.key, total: populated.length, completed, pending: populated.length - completed };
  }), [rows]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const handleFilterChange = event => {
    const { name, value } = event.target;
    setDraftFilters(current => ({ ...current, [name]: name === 'alertBeforeDays' ? Math.max(0, Number(value)) : value }));
  };
  const applyFilters = event => {
    event.preventDefault();
    setPageNo(1);
    setFilters(draftFilters);
  };
  const changePageSize = event => {
    setPageSize(Number(event.target.value));
    setPageNo(1);
  };

  return (
    <div className="oa-page">
      <header className="oa-header">
        <button type="button" className="oa-back" onClick={() => navigate(-1)} aria-label="Go back"><FiArrowLeft /></button>
        <div className="oa-header__icon"><FiAlertTriangle /></div>
        <div className="oa-header__copy">
          <h1>Order Alerts</h1>
          <p>Track upcoming deliveries and production progress</p>
        </div>
        <div className="oa-header__total"><strong>{totalRecords}</strong><span>matching suborders</span></div>
      </header>

      <main className="oa-content">
        <form className="oa-filter-card" onSubmit={applyFilters}>
          <div className="oa-filter-card__heading"><FiFilter /><span>Alert filters</span></div>
          <div className="oa-filters">
            <label className="oa-field oa-field--type"><span>Order Type</span>
              <select name="orderType" value={draftFilters.orderType} onChange={handleFilterChange}>
                <option value="">All types</option>
                {ORDER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="oa-field oa-field--salesman"><span>Salesman</span>
              <select name="salesmanId" value={draftFilters.salesmanId} onChange={handleFilterChange}>
                <option value="">All salesmen</option>
                {salesmen.map((user, index) => <option key={user.id ?? user.userId ?? index} value={user.id ?? user.userId}>{salesmanLabel(user)}</option>)}
              </select>
            </label>
            <label className="oa-field"><span>From Date</span><span className="oa-input-icon"><FiCalendar /><input type="date" name="fromDate" value={draftFilters.fromDate} onChange={handleFilterChange} /></span></label>
            <label className="oa-field"><span>To Date</span><span className="oa-input-icon"><FiCalendar /><input type="date" name="toDate" value={draftFilters.toDate} onChange={handleFilterChange} /></span></label>
            <label className="oa-field oa-field--days"><span>Alert before days</span><input type="number" min="0" max="365" name="alertBeforeDays" value={draftFilters.alertBeforeDays} onChange={handleFilterChange} /></label>
            <div className="oa-filter-actions">
              <button type="submit" className="oa-button oa-button--primary" disabled={loading}><FiRefreshCw className={loading ? 'oa-spin' : ''} /> Go</button>
              <button type="button" className="oa-button oa-button--print" onClick={() => window.print()}><FiPrinter /> Print</button>
            </div>
          </div>
        </form>

        <section className="oa-table-card" aria-label="Order alert list">
          <div className="oa-table-toolbar">
            <label className="oa-page-size">Show
              <select value={pageSize} onChange={changePageSize}>
                {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              Records
            </label>
            <label className="oa-sort">Sort by
              <select value={sortBy} onChange={event => setSortBy(event.target.value)}>
                <option value="default">Default</option>
                <option value="remainingDays">Remaining days</option>
                <option value="deliveryDate">Delivery date</option>
                <option value="orderNo">Order number</option>
              </select>
            </label>
            <label className="oa-search"><FiSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search this page" /></label>
          </div>

          {error && <div className="oa-state oa-state--error"><FiAlertTriangle /><span>{error}</span><button type="button" onClick={loadAlerts}>Retry</button></div>}
          {!error && loading && <div className="oa-state"><span className="oa-loader" /> Loading order alerts…</div>}
          {!error && !loading && visibleRows.length === 0 && (
            <div className="oa-state"><FiAlertTriangle /><span>{search ? 'No matching orders on this page.' : 'No order alerts match these filters.'}</span></div>
          )}

          {!error && !loading && visibleRows.length > 0 && (
            <div className="oa-table-scroll">
              <table className="oa-table">
                <thead>
                  <tr>
                    <th>Action</th><th>Remaining Days</th><th>Order No</th><th>Order Type</th><th>Kandoora No</th><th>Grade</th><th>Description</th><th>Delivery Date</th>
                    {PROCESS_COLUMNS.map((column, index) => {
                      const count = processCounts[index];
                      return <th key={column.key} className="oa-process-heading"><span className="oa-process-heading__count">{count.total}</span><span>{column.label}</span></th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => {
                    const key = row.orderDetailId ?? `${row.orderId}-${index}`;
                    const days = remainingDays(row.deliveryDate);
                    const isExpanded = expandedId === key;
                    return <React.Fragment key={key}>
                      <tr>
                        <td><button type="button" className="oa-row-action" aria-label={`${isExpanded ? 'Hide' : 'Show'} details for order ${row.orderNo}`} title="Order details" onClick={() => setExpandedId(isExpanded ? null : key)}><FiBarChart2 /></button></td>
                        <td><span className={`oa-days ${days !== null && days < 0 ? 'oa-days--late' : ''}`}>{days === null ? '—' : `${days.toFixed(2)} Days ${days < 0 ? 'late' : 'due'}`}</span></td>
                        <td className="oa-order-no">{row.orderNo || row.orderId || '—'}</td>
                        <td>{row.orderType || '—'}</td><td>{row.subOrderNo || '—'}</td><td>{row.grade || '—'}</td><td>{row.description || '—'}</td><td>{formatDate(row.deliveryDate)}</td>
                        {PROCESS_COLUMNS.map(column => {
                          const status = getProcessStatus(row[column.key]);
                          return <td key={column.key}>{status ? <span className={`oa-process ${statusClass(row[column.key])}`}>{status}</span> : <span className="oa-empty-cell">—</span>}</td>;
                        })}
                      </tr>
                      {isExpanded && <tr className="oa-expanded-row"><td colSpan={15}>
                        <div className="oa-expanded-content">
                          <div><small>Order status</small><strong>{row.status || '—'}</strong></div>
                          <div><small>Quantity</small><strong>{row.orderQty ?? 0}</strong></div>
                          <div><small>Subtotal</small><strong>AED {Number(row.subTotalAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                          <div className={row.hasAdvancePayment ? 'is-complete' : 'is-pending'}>{row.hasAdvancePayment ? <FiCheckCircle /> : <FiXCircle />}<span>{row.hasAdvancePayment ? 'Advance received' : 'No advance payment'}</span></div>
                          <div className={row.hasMeasurement ? 'is-complete' : 'is-pending'}>{row.hasMeasurement ? <FiCheckCircle /> : <FiXCircle />}<span>{row.hasMeasurement ? 'Measurement recorded' : 'Measurement missing'}</span></div>
                        </div>
                      </td></tr>}
                    </React.Fragment>;
                  })}
                </tbody>
                <tfoot><tr>
                  <td colSpan="2" className="oa-footer-label">Showing {Math.min((pageNo - 1) * pageSize + 1, totalRecords)}–{Math.min(pageNo * pageSize, totalRecords)} of {totalRecords}</td>
                  <td colSpan="6" className="oa-footer-total">Page totals</td>
                  {processCounts.map(count => <td key={count.key}><span className="oa-footer-count oa-footer-count--pending">Pending: {count.pending}</span><span className="oa-footer-count oa-footer-count--complete">Completed: {count.completed}</span></td>)}
                </tr></tfoot>
              </table>
            </div>
          )}

          {totalRecords > 0 && <footer className="oa-pagination">
            <span>Page {pageNo} of {totalPages}</span>
            <div><button type="button" aria-label="Previous page" disabled={pageNo <= 1 || loading} onClick={() => setPageNo(page => page - 1)}><FiChevronLeft /></button><button type="button" aria-label="Next page" disabled={pageNo >= totalPages || loading} onClick={() => setPageNo(page => page + 1)}><FiChevronRight /></button></div>
          </footer>}
        </section>
      </main>
    </div>
  );
}

export default OrderAlerts;
