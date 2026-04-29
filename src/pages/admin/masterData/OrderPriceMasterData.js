import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiDownload, FiPlus, FiDollarSign, FiCalendar } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import { useNotification } from '../../../components/Notification';
import {
  getOrderPrices, getOrderPriceById, createOrderPrice, updateOrderPrice, deleteOrderPrice,
} from '../../../services/api/orderPriceApi';
import { tableHeaderFormat } from '../../../utils/tableHeaderFormat';
import { commonLogic } from '../../../utils/commonLogic';
import { mergeValidationErrorsFromApi, parseApiValidationErrors } from '../../../utils/apiError';
import './OrderPriceMasterData.css';

const EMPTY_FORM = { price: '', validFrom: '', validTo: '' };

function OrderPriceMasterData() {
  const { success, error: showError, confirm } = useNotification();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrderPrices(pageNo, pageSize);
      if (res.success) {
        setItems(res.data?.data || []);
        setTotalRecords(res.data?.totalRecords ?? 0);
      } else {
        showError(res.message || 'Failed to load order prices');
      }
    } catch (e) {
      showError(e.message || 'Failed to load order prices');
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, showError]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Validation ──────────────────────────────────────────────────
  const validate = (form) => {
    const errors = {};
    if (form.price === '' || form.price === undefined) errors.price = 'Price is required';
    else if (isNaN(Number(form.price)) || Number(form.price) < 0) errors.price = 'Enter a valid price';
    if (!form.validFrom) errors.validFrom = 'Valid From date is required';
    if (!form.validTo) errors.validTo = 'Valid To date is required';
    if (form.validFrom && form.validTo && form.validTo < form.validFrom)
      errors.validTo = 'Valid To must be after Valid From';
    return errors;
  };

  // ── Actions ─────────────────────────────────────────────────────
  const handleAction = async (action, row) => {
    switch (action) {
      case 'view': {
        const res = await getOrderPriceById(row.id).catch(() => null);
        setSelected(res?.data || row);
        setViewOpen(true);
        break;
      }
      case 'edit': {
        const res = await getOrderPriceById(row.id).catch(() => null);
        const d = res?.data || row;
        setSelected(d);
        setEditForm({
          price: d.price ?? '',
          validFrom: d.validFrom ? d.validFrom.substring(0, 10) : '',
          validTo: d.validTo ? d.validTo.substring(0, 10) : '',
        });
        setEditErrors({});
        setEditOpen(true);
        break;
      }
      case 'delete':
        confirm({
          type: 'danger',
          title: 'Delete Order Price',
          message: `Delete order price #${row.id}? This cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }).then(async (ok) => {
          if (!ok) return;
          setLoading(true);
          try {
            const res = await deleteOrderPrice(row.id);
            if (res.success) { success('Order price deleted'); fetchItems(); }
            else showError(res.message || 'Delete failed');
          } catch (e) { showError(e.message || 'Delete failed'); }
          finally { setLoading(false); }
        });
        break;
      default: break;
    }
  };

  // ── Add ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm({ ...EMPTY_FORM });
    setAddErrors({});
    setAddOpen(true);
  };

  const handleSaveAdd = async () => {
    const errors = validate(addForm);
    setAddErrors(errors);
    if (Object.keys(errors).length) { showError('Please fix the errors'); return; }

    setSaving(true);
    try {
      const res = await createOrderPrice({
        price: parseFloat(addForm.price),
        validFrom: addForm.validFrom,
        validTo: addForm.validTo,
      });
      if (res.success) {
        success('Order price created');
        setAddOpen(false);
        fetchItems();
      } else {
        const fieldErrors = parseApiValidationErrors(res);
        if (fieldErrors) setAddErrors(prev => ({ ...prev, ...fieldErrors }));
        showError(res.message || 'Create failed');
      }
    } catch (e) {
      mergeValidationErrorsFromApi(e, setAddErrors);
      showError(e.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!selected) return;
    const errors = validate(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length) { showError('Please fix the errors'); return; }

    setSaving(true);
    try {
      const res = await updateOrderPrice(selected.id, {
        price: parseFloat(editForm.price),
        validFrom: editForm.validFrom,
        validTo: editForm.validTo,
      });
      if (res.success) {
        success('Order price updated');
        setEditOpen(false);
        setSelected(null);
        fetchItems();
      } else {
        const fieldErrors = parseApiValidationErrors(res);
        if (fieldErrors) setEditErrors(prev => ({ ...prev, ...fieldErrors }));
        showError(res.message || 'Update failed');
      }
    } catch (e) {
      mergeValidationErrorsFromApi(e, setEditErrors);
      showError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Toolbar ─────────────────────────────────────────────────────
  const toolbar = (
    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', background: 'var(--bg-primary)' }}>
        <Button variant="ghost" icon={<FiDownload />} title="Export" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={fetchItems} loading={loading} disabled={loading} title="Reload" />
      </div>
      <Button variant="primary" icon={<FiPlus />} onClick={openAdd}>
        Add Price
      </Button>
    </div>
  );

  return (
    <div className="op-master">
      <DataGrid
        data={items}
        columns={tableHeaderFormat.orderPriceData}
        onAction={handleAction}
        loading={loading}
        pageSize={pageSize}
        serverSide
        page={pageNo}
        totalRecords={totalRecords}
        onPageChange={setPageNo}
        printTitle="Order Prices"
        searchPlaceholder="Search order prices..."
        emptyMessage="No order prices found"
        defaultActions={{ view: true, edit: true, delete: true }}
        toolbar={toolbar}
        showPagination
      />

      {/* ── View Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={viewOpen}
        onClose={() => { setViewOpen(false); setSelected(null); }}
        title="Order Price Details"
        size="small"
        type="info"
        showCloseButton
      >
        {selected && (
          <div className="op-detail-grid">
            <Detail label="ID" value={selected.id} />
            <Detail label="Price" value={selected.price != null ? Number(selected.price).toFixed(2) : '—'} />
            <Detail label="Valid From" value={commonLogic.formatDate(selected.validFrom)} />
            <Detail label="Valid To" value={commonLogic.formatDate(selected.validTo)} />
          </div>
        )}
      </Modal>

      {/* ── Add Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Order Price"
        size="small"
        loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => setAddOpen(false), variant: 'secondary', disabled: saving },
          { label: 'Create', onClick: handleSaveAdd, variant: 'primary', disabled: saving },
        ]}
      >
        <PriceForm form={addForm} setForm={setAddForm} errors={addErrors} setErrors={setAddErrors} />
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Order Price"
        size="small"
        loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => { setEditOpen(false); setSelected(null); }, variant: 'secondary', disabled: saving },
          { label: 'Save Changes', onClick: handleSaveEdit, variant: 'primary', disabled: saving },
        ]}
      >
        <PriceForm form={editForm} setForm={setEditForm} errors={editErrors} setErrors={setEditErrors} />
      </Modal>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────
function Detail({ label, value }) {
  return (
    <div className="op-detail-row">
      <span className="op-detail-label">{label}</span>
      <span className="op-detail-value">{value}</span>
    </div>
  );
}

function PriceForm({ form, setForm, errors, setErrors }) {
  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  return (
    <div className="modal-form">
      <div className="form-group">
        <TextBox
          label="Price" required type="tel"
          leftIcon={<FiDollarSign />}
          value={form.price}
          onChange={e => set('price', e.target.value)}
          placeholder="0.00"
          error={errors.price}
        />
      </div>
      <div className="form-group">
        <TextBox
          label="Valid From" required type="date"
          leftIcon={<FiCalendar />}
          value={form.validFrom}
          onChange={e => set('validFrom', e.target.value)}
          error={errors.validFrom}
        />
      </div>
      <div className="form-group">
        <TextBox
          label="Valid To" required type="date"
          leftIcon={<FiCalendar />}
          value={form.validTo}
          onChange={e => set('validTo', e.target.value)}
          error={errors.validTo}
        />
      </div>
    </div>
  );
}

export default OrderPriceMasterData;
