import React, { useEffect, useMemo, useState } from 'react';
import { FiImage, FiLoader, FiMessageCircle, FiSave, FiX } from 'react-icons/fi';
import { getOrderById, updateItemStatus } from '../../services/api/ordersApi';
import { apiBasePath } from '../../services/api/commonApi';
import './StatusPopup.css';

function unwrapData(response) {
  let value = response?.data ?? response;
  if (value?.data !== undefined) value = value.data;
  if (value?.data !== undefined && !Array.isArray(value)) value = value.data;
  return value;
}

function imageUrl(path) {
  if (!path) return '';
  return /^https?:\/\//i.test(path) ? path : `${apiBasePath}${path.startsWith('/') ? '' : '/'}${path}`;
}

function displayStatus(value) {
  const status = String(value || 'Active').replaceAll('_', ' ').trim().toLowerCase();
  if (['completed', 'done', 'finished', 'delivered'].includes(status)) return 'Completed';
  if (['processing', 'in progress', 'in-progress', 'packing'].includes(status)) return 'In Progress';
  if (['cancelled', 'canceled'].includes(status)) return 'Cancelled';
  return 'Not Started';
}

function apiStatus(value) {
  const status = String(value || 'Active').trim().toLowerCase();
  if (['completed', 'done', 'finished'].includes(status)) return 'Completed';
  if (['processing', 'in progress', 'in-progress'].includes(status)) return 'Processing';
  if (status === 'packing') return 'Packing';
  if (status === 'delivered') return 'Delivered';
  if (status === 'altered') return 'Altered';
  if (['cancelled', 'canceled'].includes(status)) return 'Cancelled';
  return 'Active';
}

export default function StatusPopup({ order, onSaved }) {
  const [currentOrder, setCurrentOrder] = useState(order || null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!order?.id) return undefined;
    let active = true;
    setLoading(true);
    getOrderById(order.id)
      .then(response => {
        if (active) setCurrentOrder(unwrapData(response) || order);
      })
      .catch(() => {
        if (active) setCurrentOrder(order);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [order]);

  const subOrders = useMemo(() => currentOrder?.orderDetails || [], [currentOrder]);
  const selectedSubOrder = subOrders[selectedIndex] || null;

  useEffect(() => {
    setNote(selectedSubOrder?.note || '');
    setError('');
    setNotice('');
  }, [selectedSubOrder?.id, selectedSubOrder?.note]);

  const handleSave = async () => {
    if (!selectedSubOrder?.id) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateItemStatus(selectedSubOrder.id, {
        status: apiStatus(selectedSubOrder.status || selectedSubOrder.statusStr),
        note
      });
      const response = await getOrderById(currentOrder.id);
      const savedOrder = unwrapData(response) || {
        ...currentOrder,
        orderDetails: subOrders.map((item, index) => index === selectedIndex ? { ...item, note } : item)
      };
      setCurrentOrder(savedOrder);
      onSaved?.(savedOrder);
      setNotice('Status note saved.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save the status note.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickupMessage = () => {
    const rawPhone = currentOrder?.customerNumber || `${currentOrder?.customer?.isdCode || currentOrder?.customer?.ISDCode || ''}${currentOrder?.customer?.mobile || currentOrder?.customer?.Mobile || ''}`;
    const phone = String(rawPhone).replace(/[^\d]/g, '');
    if (!phone) {
      setError('No customer phone number is available for the pickup message.');
      return;
    }
    const orderNumber = selectedSubOrder?.orderNo || currentOrder?.orderNo || currentOrder?.id;
    const message = `Your Kandoora order ${orderNumber} is ready for pickup.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setError('');
  };

  if (!currentOrder) return null;

  const imagePath = selectedSubOrder?.measurement?.modelImageUrl || selectedSubOrder?.imagePath || '';
  const imageSrc = imageUrl(imagePath);
  const workTypes = selectedSubOrder?.workTypes || [];
  const overallStatus = selectedSubOrder?.statusStr || selectedSubOrder?.status || currentOrder.statusStr || currentOrder.status || 'Active';

  return (
    <div className="status-popup">
      {loading ? <div className="status-popup__loading"><FiLoader className="so-button-spinner" /> Loading order status…</div> : selectedSubOrder ? <>
        <section className="status-popup__panel">
          <div className="status-popup__summary">
            <strong>Kandoora Number: {selectedSubOrder.orderNo || `Suborder ${selectedIndex + 1}`}</strong>
            <strong>Kandoora Status: {overallStatus}</strong>
            {selectedSubOrder.packingType && <strong>Packing: {selectedSubOrder.packingType}</strong>}
          </div>

          <div className="status-popup__table-wrap">
            <table className="status-popup__table">
              <thead><tr><th>Work Type</th><th>Completed On</th><th>Completed By</th><th>Image</th><th>Status</th></tr></thead>
              <tbody>
                {workTypes.length ? workTypes.map((workType, index) => (
                  <tr key={workType.id || workType.workTypeId || `${selectedSubOrder.id}-${index}`}>
                    <td>{workType.name || workType.code || `Work Type ${index + 1}`}</td>
                    <td>{workType.completedOn || '—'}</td>
                    <td>{workType.completedByName || workType.completedBy || '—'}</td>
                    {index === 0 && <td className="status-popup__image-cell" rowSpan={workTypes.length}>
                      <button type="button" className={`status-popup__image ${imageSrc ? 'has-image' : ''}`} onClick={() => imageSrc && setZoomOpen(true)} disabled={!imageSrc} aria-label={imageSrc ? 'Zoom suborder image' : 'No suborder image'}>
                        {imageSrc ? <img src={imageSrc} alt="Suborder reference" /> : <FiImage />}
                      </button>
                      <span>Click on image to zoom</span>
                    </td>}
                    <td><span className={`status-popup__badge status-popup__badge--${displayStatus(workType.isSaved ? 'completed' : workType.status).toLowerCase().replace(' ', '-')}`}>{displayStatus(workType.isSaved ? 'completed' : workType.status)}</span></td>
                  </tr>
                )) : <tr><td colSpan="5" className="status-popup__empty">No work types assigned to this suborder.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="status-popup__note">
            <label htmlFor="status-popup-note">Note</label>
            <div><textarea id="status-popup-note" rows="1" value={note} onChange={event => setNote(event.target.value)} />
              <button type="button" onClick={handleSave} disabled={saving || loading}>{saving ? <FiLoader className="so-button-spinner" /> : <FiSave />} Save</button></div>
          </div>

          {(error || notice) && <div className={`status-popup__message ${error ? 'is-error' : 'is-success'}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}

          <div className="status-popup__panel-footer">
            <button type="button" className="status-popup__pickup" onClick={handlePickupMessage}><FiMessageCircle /> Send Pickup Message</button>
            <nav className="status-popup__pagination" aria-label="Suborder pages">
              <button type="button" onClick={() => setSelectedIndex(index => Math.max(0, index - 1))} disabled={selectedIndex === 0}>Prev</button>
              {subOrders.map((item, index) => <button type="button" key={item.id || index} className={index === selectedIndex ? 'is-active' : ''} aria-current={index === selectedIndex ? 'page' : undefined} onClick={() => setSelectedIndex(index)}>{index + 1}</button>)}
              <button type="button" onClick={() => setSelectedIndex(index => Math.min(subOrders.length - 1, index + 1))} disabled={selectedIndex >= subOrders.length - 1}>Next</button>
            </nav>
          </div>
        </section>
      </> : <div className="status-popup__empty">No suborders found.</div>}

      {zoomOpen && <button className="status-popup__zoom" type="button" onClick={() => setZoomOpen(false)} aria-label="Close image zoom"><img src={imageSrc} alt="Zoomed suborder reference" /><span><FiX /></span></button>}
    </div>
  );
}
