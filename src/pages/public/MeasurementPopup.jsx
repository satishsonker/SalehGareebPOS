import React, { useEffect, useMemo, useState } from 'react';
import { getOrderById, updateOrder, updateItemMeasurement } from '../../services/api/ordersApi';

const measurementFields = ['neckline', 'length', 'sleeve', 'chest', 'waist', 'hip', 'shoulder', 'notes'];

export default function MeasurementPopup({ order, onClose, onSaved }) {
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

  const updateMeasurement = (field, value) => {
    if (!currentOrder || !selectedSubOrder) return;

    setCurrentOrder((prev) => ({
      ...prev,
      orderDetails: (prev.orderDetails || []).map((item, index) => {
        if (index !== selectedIndex) return item;
        const measurement = { ...(item.measurement || {}) };
        measurement[field] = value;
        return { ...item, measurement };
      })
    }));
  };

  const handleSave = async () => {
    if (!currentOrder) return;
    setSaving(true);
    try {
      // Prefer suborder measurement endpoint for the selected suborder
      if (selectedSubOrder && selectedSubOrder.id) {
        const res = await updateItemMeasurement(selectedSubOrder.id, selectedSubOrder.measurement || {});
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
      console.error('Measurement save failed', error);
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
            {measurementFields.map((field) => (
              <div key={field}>
                <span>{field}</span>
                <input
                  type="text"
                  value={selectedSubOrder.measurement?.[field] ?? ''}
                  onChange={(event) => updateMeasurement(field, event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="so-modal__empty">No measurements available.</div>
      )}

      <div className="so-modal__actions">
        <button type="button" className="so-modal__primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Measurement'}
        </button>
        <button type="button" className="so-modal__secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
