import React, { useEffect, useMemo, useState } from 'react';
import { FiClipboard, FiLoader, FiPrinter, FiRefreshCw, FiSave } from 'react-icons/fi';
import { getOrders, getOrderById, updateItemMeasurement, updateSubOrderWorkTypes } from '../../services/api/ordersApi';
import { getUsers } from '../../services/api/usersApi';
import { apiBasePath } from '../../services/api/commonApi';
import './Worksheet.css';
import { commonLogic } from '../../utils/commonLogic';

const unwrap = response => response?.data?.data ?? response?.data ?? response;
const employeeName = user => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || `User ${user.id}`;
const money = value => Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateValue = value => value ? String(value).slice(0, 10) : '';

export default function Worksheet() {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [order, setOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState('');
  const [workTypes, setWorkTypes] = useState([]);
  const [modelNo, setModelNo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadLists = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersResult, usersResult] = await Promise.all([getOrders(1, commonLogic.maxPageSize), getUsers(1, commonLogic.maxPageSize)]);
      const orderData = unwrap(ordersResult);
      const userData = unwrap(usersResult);
      setOrders(Array.isArray(orderData?.data) ? orderData.data : Array.isArray(orderData) ? orderData : []);
      setEmployees((Array.isArray(userData?.data) ? userData.data : Array.isArray(userData) ? userData : []).filter(user => !user.isBlocked));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load orders and employees.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadLists(); }, []);

  const loadOrder = async orderId => {
    setSelectedOrderId(orderId);
    setSelectedDetailId('');
    setOrder(null);
    setWorkTypes([]);
    setNotice('');
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const detail = unwrap(await getOrderById(orderId));
      setOrder(detail);
      setSelectedDetailId(String(detail?.orderDetails?.[0]?.id || ''));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load this order.');
    } finally { setLoading(false); }
  };

  const selectedDetail = useMemo(() => order?.orderDetails?.find(item => String(item.id) === String(selectedDetailId)) || null, [order, selectedDetailId]);

  useEffect(() => {
    setWorkTypes((selectedDetail?.workTypes || []).map(item => ({
      ...item,
      completedAt: item.completedAt || '',
      price: item.price ?? 0,
      extra: item.extra ?? 0,
      crystalUsedPackets: item.crystalUsedPackets ?? 0,
      note: item.note || ''
    })));
    setModelNo(selectedDetail?.measurement?.modelNo || '');
  }, [selectedDetail]);

  const updateWorkType = (index, field, value) => setWorkTypes(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const labourTotal = workTypes.reduce((sum, item) => sum + Number(item.price || 0) + Number(item.extra || 0), 0);
  const crystalUsed = workTypes.reduce((sum, item) => sum + Number(item.crystalUsedPackets || 0), 0);

  const save = async () => {
    if (!selectedDetail) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await updateItemMeasurement(selectedDetail.id, { ...(selectedDetail.measurement || {}), modelNo });
      await updateSubOrderWorkTypes(selectedDetail.id, workTypes.map(item => ({
        ...item,
        completedAt: item.completedAt || null,
        price: Number(item.price || 0),
        extra: Number(item.extra || 0),
        crystalUsedPackets: Number(item.crystalUsedPackets || 0)
      })));
      await loadOrder(selectedOrderId);
      setNotice('Worksheet saved.');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save the worksheet.');
    } finally { setSaving(false); }
  };

  const measurement = selectedDetail?.measurement || {};

  return <main className="worksheet-page">
    <header className="worksheet-header">
      <div className="worksheet-header__icon"><FiClipboard /></div>
      <div><h1>Worksheet</h1><p>Production steps, staff, charges, and suborder measurements</p></div>
      <div className="worksheet-header__actions">
        <button type="button" onClick={() => loadOrder(selectedOrderId || '')} disabled={loading}><FiRefreshCw /> Refresh</button>
        <button type="button" onClick={() => window.print()} disabled={!selectedDetail}><FiPrinter /> Print</button>
      </div>
    </header>

    <section className="worksheet-card worksheet-selectors">
      <label>Order<select value={selectedOrderId} onChange={event => loadOrder(event.target.value)}>
        <option value="">Select an order</option>{orders.map(item => <option key={item.id} value={item.id}>{item.orderNo} · {item.customerName}</option>)}
      </select></label>
      <label>Suborder<select value={selectedDetailId} onChange={event => setSelectedDetailId(event.target.value)} disabled={!order}>
        <option value="">Select a suborder</option>{(order?.orderDetails || []).map(item => <option key={item.id} value={item.id}>{item.orderNo}</option>)}
      </select></label>
      {selectedDetail && <div className="worksheet-metrics"><span>Subtotal<strong>AED {money(selectedDetail.subtotalAmount)}</strong></span><span>Work charges<strong>AED {money(labourTotal)}</strong></span><span>Estimated margin<strong>AED {money(Number(selectedDetail.subtotalAmount || 0) - labourTotal)}</strong></span></div>}
    </section>

    {error && <div className="worksheet-message worksheet-message--error" role="alert">{error}</div>}
    {notice && <div className="worksheet-message worksheet-message--success" role="status">{notice}</div>}
    {loading && <div className="worksheet-empty"><FiLoader className="worksheet-spin" /> Loading worksheet…</div>}
    {!loading && !selectedDetail && !error && <div className="worksheet-empty">Select an order and suborder to view its worksheet.</div>}

    {!loading && selectedDetail && <>
      <section className="worksheet-card worksheet-order-info">
        <div><small>Customer</small><strong>{order.customerName || '—'}</strong></div>
        <div><small>Salesperson</small><strong>{order.employeeName || '—'}</strong></div>
        <div><small>Delivery date</small><strong>{selectedDetail.deliveryDate ? new Date(selectedDetail.deliveryDate).toLocaleDateString() : '—'}</strong></div>
        <div><small>Order status</small><strong>{selectedDetail.status || '—'}</strong></div>
        <div><small>Crystal packets</small><strong>{selectedDetail.crystalPackets || 0} requested / {crystalUsed} used</strong></div>
        <div><small>Model</small><strong>{modelNo || '—'}</strong></div>
      </section>

      <section className="worksheet-card worksheet-production">
        <div className="worksheet-section-title"><div><h2>Production steps</h2><p>Save completion details and charges for each assigned work type.</p></div><button type="button" className="worksheet-save" onClick={save} disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save worksheet'}</button></div>
        {workTypes.length ? <div className="worksheet-table-wrap"><table className="worksheet-table"><thead><tr><th>Work type</th><th>Employee</th><th>Completed on</th><th>Charge</th><th>Alter charge</th><th>Crystal used</th><th>Note</th><th>Saved</th></tr></thead><tbody>
          {workTypes.map((item, index) => <tr key={item.id || item.workTypeId || index}>
            <td><strong>{item.name || item.code || `Work type ${index + 1}`}</strong><small>{(item.workDescriptions || []).map(description => description.name).filter(Boolean).join(', ')}</small></td>
            <td><select value={item.completedBy || ''} onChange={event => updateWorkType(index, 'completedBy', event.target.value ? Number(event.target.value) : null)}><option value="">Select employee</option>{employees.map(user => <option key={user.id} value={user.id}>{employeeName(user)}</option>)}</select></td>
            <td><input type="date" value={dateValue(item.completedAt)} onChange={event => updateWorkType(index, 'completedAt', event.target.value)} /></td>
            <td><input type="number" min="0" step="0.01" value={item.price} onChange={event => updateWorkType(index, 'price', event.target.value)} /></td>
            <td><input type="number" min="0" step="0.01" value={item.extra} onChange={event => updateWorkType(index, 'extra', event.target.value)} /></td>
            <td>{String(item.name || '').toLowerCase().includes('crystal') ? <input aria-label="Crystal packets used" type="number" min="0" step="0.01" value={item.crystalUsedPackets} onChange={event => updateWorkType(index, 'crystalUsedPackets', event.target.value)} /> : '—'}</td>
            <td><input aria-label={`${item.name || 'Work type'} note`} value={item.note || ''} onChange={event => updateWorkType(index, 'note', event.target.value)} /></td>
            <td><label className="worksheet-saved"><input type="checkbox" checked={Boolean(item.isSaved)} onChange={event => updateWorkType(index, 'isSaved', event.target.checked)} /> Done</label></td>
          </tr>)}
        </tbody></table></div> : <div className="worksheet-empty">No work types are assigned to this suborder.</div>}
        <label className="worksheet-note">Model number<input value={modelNo} onChange={event => setModelNo(event.target.value)} /></label>
        <label className="worksheet-note">Suborder note<textarea value={selectedDetail.note || ''} readOnly rows="2" /></label>
      </section>

      <section className="worksheet-card worksheet-measurements">
        <h2>Measurements</h2><div className="worksheet-measurement-grid">{[
          ['length','Length'],['chest','Chest'],['waist','Waist'],['hip','Hips'],['bottom','Bottom'],['sleeve','Sleeve'],['sleeveLoose','Sleeve loose'],['shoulder','Shoulder'],['neck','Neck'],['deep','Deep'],['backDown','Back down'],['extra','Extra'],['size','Size'],['shape','Shape']
        ].map(([key,label]) => <div key={key}><small>{label}</small><strong>{measurement[key] || '—'}</strong></div>)}</div>
        {measurement.modelImageUrl && <img className="worksheet-model-image" src={/^https?:/i.test(measurement.modelImageUrl) ? measurement.modelImageUrl : `${apiBasePath}${measurement.modelImageUrl}`} alt="Suborder model reference" />}
      </section>
    </>}
  </main>;
}
