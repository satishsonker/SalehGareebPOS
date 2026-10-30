import React, { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiPackage, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { getOrders, packSubOrders } from '../../services/api/ordersApi';
import { getUsers } from '../../services/api/usersApi';
import { commonLogic } from '../../utils/commonLogic';
import './OrderPacking.css';

const unwrap = response => response?.data?.data ?? response?.data ?? response;
const employeeName = user => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || `Employee ${user.id}`;
const money = amount => Number(amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = value => value ? new Date(value).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' }) : '—';

export default function OrderPacking() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [packedById, setPackedById] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const readAllPages = async getter => {
        const pageSize = commonLogic.maxPageSize;
        const firstPayload = unwrap(await getter(1, pageSize));
        const results = Array.isArray(firstPayload?.data) ? [...firstPayload.data] : Array.isArray(firstPayload) ? [...firstPayload] : [];
        const totalPages = Math.ceil(Number(firstPayload?.totalRecords || results.length) / pageSize);
        for (let page = 2; page <= totalPages; page++) {
          const payload = unwrap(await getter(page, pageSize));
          results.push(...(Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []));
        }
        return results;
      };
      const [orders, users] = await Promise.all([readAllPages(getOrders), readAllPages(getUsers)]);
      setItems(orders.flatMap(order => (order.orderDetails || [])
        .filter(item => String(item.statusStr || item.status).toLowerCase() === 'completed')
        .map(item => ({ ...item, orderNo: item.orderNo, customerName: order.customerName, orderDate: order.orderDate, deliveryDate: order.deliveryDate }))));
      setEmployees(users.filter(user => !user.isBlocked));
    } catch (loadError) { setError(loadError.message || 'Could not load completed suborders.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? items.filter(item => [item.orderNo, item.customerName].some(value => String(value || '').toLowerCase().includes(term))) : items;
  }, [items, search]);

  const toggle = (id, checked) => setSelectedIds(ids => checked ? [...new Set([...ids, id])] : ids.filter(itemId => itemId !== id));
  const selectVisible = () => setSelectedIds(ids => [...new Set([...ids, ...filteredItems.map(item => item.id)])]);
  const confirmPacking = async () => {
    setSaving(true); setError('');
    try {
      await packSubOrders({ orderDetailIds: selectedIds, packedById: Number(packedById) });
      setMessage(`${selectedIds.length} suborder${selectedIds.length === 1 ? '' : 's'} packed successfully.`);
      setSelectedIds([]); setConfirmOpen(false);
      await load();
    } catch (saveError) { setError(saveError.message || 'Could not update packing status.'); setConfirmOpen(false); }
    finally { setSaving(false); }
  };

  return <main className="packing-page">
    <header className="packing-header"><div className="packing-header__icon"><FiPackage /></div><div><h1>Order Packing</h1><p>Completed suborders ready to pack</p></div><button type="button" onClick={load} disabled={loading}><FiRefreshCw className={loading ? 'packing-spin' : ''} /> Refresh</button></header>
    <section className="packing-toolbar"><label className="packing-search"><FiSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search suborder or customer" /></label><button type="button" onClick={selectVisible} disabled={!filteredItems.length}>Select visible</button><label className="packing-employee">Packed by<select value={packedById} onChange={event => setPackedById(event.target.value)}><option value="">Select employee</option>{employees.map(user => <option key={user.id} value={user.id}>{employeeName(user)}</option>)}</select></label><button type="button" className="packing-submit" onClick={() => setConfirmOpen(true)} disabled={!selectedIds.length || !packedById || saving}><FiCheck /> Pack {selectedIds.length ? `(${selectedIds.length})` : 'selected'}</button></section>
    {message && <div className="packing-message" role="status">{message}<button type="button" onClick={() => setMessage('')}><FiX /></button></div>}
    {error && <div className="packing-error" role="alert">{error}</div>}
    {loading ? <div className="packing-empty">Loading completed suborders…</div> : filteredItems.length ? <div className="packing-list">{filteredItems.map(item => <label className={`packing-row ${selectedIds.includes(item.id) ? 'is-selected' : ''}`} key={item.id}>
      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event => toggle(item.id, event.target.checked)} />
      <span className="packing-row__number">{item.orderNo}</span><span className="packing-row__customer"><strong>{item.customerName || 'Customer'}</strong><small>Order date {date(item.orderDate)} · Delivery {date(item.deliveryDate)}</small></span><span className="packing-row__amount">AED {money(item.totalAmount)}</span><span className="packing-badge">Completed</span>
    </label>)}</div> : <div className="packing-empty"><FiPackage /><strong>No completed suborders found</strong><span>{search ? 'Try another search.' : 'Suborders appear here once production marks them completed.'}</span></div>}
    {confirmOpen && <div className="packing-confirm-backdrop" role="presentation"><section className="packing-confirm" role="dialog" aria-modal="true" aria-labelledby="packing-confirm-title"><span className="packing-confirm__icon"><FiPackage /></span><h2 id="packing-confirm-title">Confirm packing update</h2><p>Set {selectedIds.length} selected suborder{selectedIds.length === 1 ? '' : 's'} to Packed?</p><strong>Packed by: {employeeName(employees.find(user => String(user.id) === String(packedById)) || { id: packedById })}</strong><footer><button type="button" onClick={() => setConfirmOpen(false)} disabled={saving}>Review</button><button type="button" onClick={confirmPacking} disabled={saving}>{saving ? 'Updating…' : 'Confirm packed'}</button></footer></section></div>}
  </main>;
}
