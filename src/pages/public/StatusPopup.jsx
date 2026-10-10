import React, { useEffect, useMemo, useState } from 'react';
import { getOrderById, updateOrder, updateItemStatus } from '../../services/api/ordersApi';

const statusOptions = ['pending', 'in-progress', 'done'];

const labelForStatus = (value) => {
  const normalized = String(value || 'pending').trim().toLowerCase();
  if (normalized === 'done' || normalized === 'completed' || normalized === 'finished') return 'Done';
  if (normalized === 'in-progress' || normalized === 'in progress') return 'In Progress';
  return 'Pending';
};

export default function StatusPopup({ order, onClose, onSaved }) {
  const [currentOrder, setCurrentOrder] = useState(order || null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order?.id) return;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await getOrderById(order.id);
        const detail = response?.data?.data ?? response?.data ?? order;
        setCurrentOrder(detail);
        setSelectedIndex(0);
      } catch (error) {
        setCurrentOrder(order);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [order]);

  const subOrders = useMemo(() => currentOrder?.orderDetails || [], [currentOrder]);
  const selectedSubOrder = subOrders[selectedIndex] || null;

  const updateLocalSubOrderStatus = (status) => {
    if (!currentOrder || !selectedSubOrder) return;
    setCurrentOrder((prev) => ({
      ...prev,
      orderDetails: (prev.orderDetails || []).map((item, index) =>
        index === selectedIndex ? { ...item, status } : item
      )
    }));
  };

  const updateWorkTypeStatus = (workTypeIndex, status) => {
    if (!currentOrder || !selectedSubOrder) return;
    setCurrentOrder((prev) => ({
      ...prev,
      orderDetails: (prev.orderDetails || []).map((item, index) => {
        if (index !== selectedIndex) return item;
        const workTypes = Array.isArray(item.workTypes) ? [...item.workTypes] : [];
        workTypes[workTypeIndex] = { ...workTypes[workTypeIndex], status };
        return { ...item, workTypes };
      })
    }));
  };

  const handleSave = async () => {
    if (!currentOrder) return;
    setSaving(true);
    try {
      if (selectedSubOrder && selectedSubOrder.id) {
        const mapStatus = (s) => {
          const v = String(s || '').trim().toLowerCase();
          if (v === 'done' || v === 'completed' || v === 'finished') return 'Completed';
          if (v === 'in-progress' || v === 'in progress' || v === 'processing') return 'Processing';
          return 'Active';
        };

        const payload = { status: mapStatus(selectedSubOrder.status), note: selectedSubOrder.note || '' };
        const res = await updateItemStatus(selectedSubOrder.id, payload);
        const savedOrder = res?.data?.data ?? res?.data ?? currentOrder;
        setCurrentOrder(savedOrder);
        onSaved?.(savedOrder);
      } else {
        const result = await updateOrder(currentOrder.id, currentOrder);
        const savedOrder = result?.data?.data ?? result?.data ?? currentOrder;
        setCurrentOrder(savedOrder);
        onSaved?.(savedOrder);
      }
    } catch (error) {
      console.error('Status save failed', error);
    } finally {
      setSaving(false);
    }
  };

  if (!currentOrder) return null;

  return (
    <div className="so-modal__content">
      <div className="so-modal__section">
        <h3>Select Suborder</h3>
        <div className="so-modal__tags">
          {subOrders.map((item, index) => (
            <button
              key={item.id || `${currentOrder.id}-${index}`}
              type="button"
              className={`so-modal__chip ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              {item.orderNo || `Suborder ${index + 1}`}
            </button>
          ))}
        </div>
      </div>

      {selectedSubOrder ? (
        <div className="so-modal__section">
          <h3>{selectedSubOrder.description || `Suborder ${selectedIndex + 1}`}</h3>
          <div className="so-modal__grid so-modal__grid--compact">
            <div>
              <span>Suborder Status</span>
                      <select value={selectedSubOrder.status || 'pending'} onChange={(event) => updateLocalSubOrderStatus(event.target.value)}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{labelForStatus(status)}</option>
                ))}
              </select>
            </div>
            <div>
              <span>Completion Date</span>
              <input type="date" value={selectedSubOrder.completionDate || ''} readOnly />
            </div>
          </div>

          <div className="so-modal__items">
            {(selectedSubOrder.workTypes || []).length > 0 ? (
              selectedSubOrder.workTypes.map((workType, workTypeIndex) => (
                <div key={workType.id || `${selectedSubOrder.id}-${workTypeIndex}`} className="so-modal__item">
                  <div className="so-modal__item-header">
                    <strong>{workType.name || `Work Type ${workTypeIndex + 1}`}</strong>
                    <span>{labelForStatus(workType.status || 'pending')}</span>
                  </div>
                  <div className="so-modal__grid so-modal__grid--compact">
                    <div>
                      <span>Status</span>
                      <select value={workType.status || 'pending'} onChange={(event) => updateWorkTypeStatus(workTypeIndex, event.target.value)}>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{labelForStatus(status)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span>Completion Date</span>
                      <input type="date" value={workType.completionDate || ''} readOnly />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="so-modal__empty">No work type progress available for this suborder.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="so-modal__empty">No status details available.</div>
      )}

      <div className="so-modal__actions">
        <button type="button" className="so-modal__primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Status'}
        </button>
        <button type="button" className="so-modal__secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
