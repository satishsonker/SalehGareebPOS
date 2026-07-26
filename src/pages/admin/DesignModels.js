import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiRefreshCw, FiPlus, FiDownload, FiFilter,
  FiImage, FiDollarSign, FiTrash2, FiUpload, FiLink,
  FiInfo, FiX, FiBox,
} from 'react-icons/fi';
import DataGrid from '../../components/DataGrid';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import TextBox from '../../components/TextBox/TextBox';
import { useNotification } from '../../components/Notification';
import {
  getDesignModels, getDesignModelById, searchDesignModels,
  createDesignModel, updateDesignModel, deleteDesignModel,
  attachMedia, detachMedia, attachOrderPrice, detachOrderPrice,
} from '../../services/api/designModelApi';
import { uploadMedia } from '../../services/api/mediaApi';
import { getOrderPrices } from '../../services/api/orderPriceApi';
import { tableHeaderFormat } from '../../utils/tableHeaderFormat';
import { commonLogic } from '../../utils/commonLogic';
import { mergeValidationErrorsFromApi, parseApiValidationErrors } from '../../utils/apiError';
import './DesignModels.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:7194';

const EMPTY_FORM = { name: '', description: '', code: '', designerId: '' };

// ── Helpers ───────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.name.trim())        errs.name        = 'Name is required.';
  else if (form.name.length > 200) errs.name     = 'Name must not exceed 200 characters.';
  if (!form.description.trim()) errs.description = 'Description is required.';
  else if (form.description.length > 1000) errs.description = 'Description must not exceed 1000 characters.';
  if (!form.code.trim())        errs.code        = 'Code is required.';
  else if (!/^[A-Z0-9_-]+$/.test(form.code)) errs.code = 'Code must be uppercase alphanumeric with _ or - only.';
  else if (form.code.length > 100) errs.code     = 'Code must not exceed 100 characters.';
  if (form.designerId && (isNaN(Number(form.designerId)) || Number(form.designerId) <= 0))
    errs.designerId = 'Designer ID must be a positive integer.';
  return errs;
}

function priceStatus(price) {
  const now  = new Date(); now.setHours(0,0,0,0);
  const from = price.validFrom ? new Date(price.validFrom) : null;
  const to   = price.validTo   ? new Date(price.validTo)   : null;
  if (to)   to.setHours(0,0,0,0);
  if (from) from.setHours(0,0,0,0);
  if (to && now > to)   return { label: 'Expired',  cls: 'dm-badge--expired' };
  if (from && now < from) return { label: 'Upcoming', cls: 'dm-badge--upcoming' };
  if (to) {
    const d = Math.ceil((to - now) / 86400000);
    if (d <= 7) return { label: `Exp. ${d}d`, cls: 'dm-badge--warn' };
  }
  return { label: 'Live', cls: 'dm-badge--live' };
}

// ── Design Model Form ──────────────────────────────────────────────
function DesignModelForm({ form, errors, onChange }) {
  return (
    <div className="modal-form">
      <div className="form-group">
        <TextBox
          label="Name *"
          value={form.name}
          onChange={v => onChange('name', v)}
          error={errors.name}
          placeholder="Enter design model name"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className={`dm-textarea${errors.description ? ' dm-textarea--error' : ''}`}
          value={form.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Enter description"
          rows={4}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>
      <div className="dm-two-col">
        <div className="form-group">
          <TextBox
            label="Code *"
            value={form.code}
            onChange={v => onChange('code', v.toUpperCase())}
            error={errors.code}
            placeholder="e.g. MODEL-001"
          />
        </div>
        <div className="form-group">
          <TextBox
            label="Designer ID (optional)"
            value={form.designerId}
            onChange={v => onChange('designerId', v)}
            error={errors.designerId}
            placeholder="Numeric ID"
            type="tel"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
function DesignModels() {
  const { success, error: showError, confirm } = useNotification();

  // List state
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [pageNo, setPageNo]         = useState(1);
  const [pageSize]                  = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal flags
  const [addOpen, setAddOpen]       = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [viewOpen, setViewOpen]     = useState(false);

  // Form / selection state
  const [selected, setSelected]     = useState(null); // full DesignModelDto in view/edit
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);

  // Media state
  const mediaInputRef               = useRef(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [detachingMediaId, setDetachingMediaId] = useState(null);

  // Order price attachment state
  const [availablePrices, setAvailablePrices] = useState([]);
  const [pricesLoading, setPricesLoading]     = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [priceAttaching, setPriceAttaching]   = useState(false);
  const [detachingPriceId, setDetachingPriceId] = useState(null);
  const [showPriceSelector, setShowPriceSelector] = useState(false);

  // ── Fetch list ────────────────────────────────────────────────────
  const fetchItems = useCallback(async (page = pageNo) => {
    setLoading(true);
    try {
      const res = await getDesignModels(page, pageSize);
      if (res.success) {
        setItems(res.data?.data ?? []);
        setTotalRecords(res.data?.totalRecords ?? 0);
      } else {
        showError(res.message || 'Failed to load design models');
      }
    } catch (e) {
      showError(e.message || 'Failed to load design models');
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, showError]);

  useEffect(() => { fetchItems(pageNo); }, [pageNo]); // eslint-disable-line

  // ── Refresh selected model (after media/price changes) ────────────
  const refreshSelected = useCallback(async (id) => {
    try {
      const res = await getDesignModelById(id);
      if (res.success) setSelected(res.data);
    } catch { /* silent */ }
  }, []);

  // ── Handlers: CRUD ────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setAddOpen(true);
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({
      name:       row.name        || '',
      description:row.description || '',
      code:       row.code        || '',
      designerId: row.designerId != null ? String(row.designerId) : '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const openView = async (row) => {
    setSelected(row);
    setViewOpen(true);
    setShowPriceSelector(false);
    setSelectedPriceId('');
    // Fetch full model to ensure medias + orderPrices are populated
    const res = await getDesignModelById(row.id);
    if (res.success) setSelected(res.data);
  };

  const handleAction = (action, row) => {
    if (action === 'view')   openView(row);
    if (action === 'edit')   openEdit(row);
    if (action === 'delete') handleDelete(row);
  };

  const handleSave = async (isEdit) => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name:       form.name.trim(),
        description:form.description.trim(),
        code:       form.code.trim(),
        designerId: form.designerId ? parseInt(form.designerId, 10) : null,
      };
      const res = isEdit
        ? await updateDesignModel(selected.id, payload)
        : await createDesignModel(payload);

      if (res.success) {
        success(isEdit ? 'Design model updated' : 'Design model created');
        isEdit ? setEditOpen(false) : setAddOpen(false);
        fetchItems(isEdit ? pageNo : 1);
        if (!isEdit) setPageNo(1);
      } else {
        const apiErrs = parseApiValidationErrors(res);
        if (apiErrs) setFormErrors(f => mergeValidationErrorsFromApi(f, apiErrs));
        else showError(res.message || 'Save failed');
      }
    } catch (e) {
      const apiErrs = parseApiValidationErrors(e.response);
      if (apiErrs) setFormErrors(f => mergeValidationErrorsFromApi(f, apiErrs));
      else showError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row) => {
    confirm({
      type: 'danger',
      title: 'Delete Design Model',
      message: `Delete "${row.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    }).then(async (ok) => {
      if (!ok) return;
      try {
        const res = await deleteDesignModel(row.id);
        if (res.success) { success('Design model deleted'); fetchItems(pageNo); }
        else showError(res.message || 'Delete failed');
      } catch (e) { showError(e.message || 'Delete failed'); }
    });
  };

  // ── Media handlers ────────────────────────────────────────────────
  const handleMediaFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selected) return;

    setMediaUploading(true);
    try {
      const upRes = await uploadMedia(file, 'design-models');
      // uploadMedia may return { success, data: { id, ... } } or just the data
      const mediaId = upRes?.data?.id ?? upRes?.id;
      if (!mediaId) { showError('Upload failed — no media ID returned'); return; }

      const attachRes = await attachMedia(selected.id, mediaId);
      if (attachRes.success) {
        success('Photo added');
        await refreshSelected(selected.id);
        fetchItems(pageNo);
      } else {
        showError(attachRes.message || 'Failed to attach media');
      }
    } catch (e) {
      showError(e.message || 'Upload failed');
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDetachMedia = async (media) => {
    const ok = await confirm({
      type: 'danger',
      title: 'Remove Photo',
      message: 'Remove this photo from the design model?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setDetachingMediaId(media.mediaId);
    try {
      const res = await detachMedia(selected.id, media.mediaId);
      if (res.success) {
        success('Photo removed');
        await refreshSelected(selected.id);
        fetchItems(pageNo);
      } else {
        showError(res.message || 'Remove failed');
      }
    } catch (e) { showError(e.message || 'Remove failed'); }
    finally { setDetachingMediaId(null); }
  };

  // ── Order price handlers ──────────────────────────────────────────
  const loadAvailablePrices = async () => {
    if (availablePrices.length > 0) return;
    setPricesLoading(true);
    try {
      const res = await getOrderPrices(1, 100);
      setAvailablePrices(res?.data?.data ?? res?.data ?? []);
    } catch { /* silent */ }
    finally { setPricesLoading(false); }
  };

  const handleShowPriceSelector = async () => {
    setShowPriceSelector(true);
    await loadAvailablePrices();
  };

  const handleAttachPrice = async () => {
    if (!selectedPriceId) return;
    setPriceAttaching(true);
    try {
      const res = await attachOrderPrice(selected.id, parseInt(selectedPriceId, 10));
      if (res.success) {
        success('Order price linked');
        setShowPriceSelector(false);
        setSelectedPriceId('');
        await refreshSelected(selected.id);
        fetchItems(pageNo);
      } else {
        showError(res.message || 'Failed to link order price');
      }
    } catch (e) { showError(e.message || 'Failed to link order price'); }
    finally { setPriceAttaching(false); }
  };

  const handleDetachPrice = async (priceMap) => {
    const ok = await confirm({
      type: 'danger',
      title: 'Unlink Order Price',
      message: `Unlink price "${Number(priceMap.price).toFixed(2)}" from this design model?`,
      confirmText: 'Unlink',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setDetachingPriceId(priceMap.orderPriceId);
    try {
      const res = await detachOrderPrice(selected.id, priceMap.orderPriceId);
      if (res.success) {
        success('Order price unlinked');
        await refreshSelected(selected.id);
        fetchItems(pageNo);
      } else {
        showError(res.message || 'Unlink failed');
      }
    } catch (e) { showError(e.message || 'Unlink failed'); }
    finally { setDetachingPriceId(null); }
  };

  // ── Toolbar ───────────────────────────────────────────────────────
  const toolbar = (
    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', background: 'var(--bg-primary)' }}>
        <Button variant="ghost" icon={<FiFilter />}    title="Filter" />
        <Button variant="ghost" icon={<FiDownload />}  title="Export" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={() => fetchItems(pageNo)} loading={loading} disabled={loading} title="Reload" />
      </div>
      <Button variant="primary" icon={<FiPlus />} onClick={openAdd}>
        Add Design Model
      </Button>
    </div>
  );

  // ── Linked prices — filter out already linked IDs ─────────────────
  const linkedPriceIds = new Set((selected?.orderPrices || []).map(p => p.orderPriceId));
  const unlinkedPrices = availablePrices.filter(p => !linkedPriceIds.has(p.id));

  return (
    <div className="admin-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <FiBox className="page-icon" />
          <h2>Design Models</h2>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <DataGrid
        data={items}
        columns={tableHeaderFormat.designModelData}
        onAction={handleAction}
        loading={loading}
        pageSize={pageSize}
        serverSide
        page={pageNo}
        totalRecords={totalRecords}
        onPageChange={setPageNo}
        printTitle="Design Models"
        searchPlaceholder="Search design models..."
        emptyMessage="No design models found"
        defaultActions={{ view: true, edit: true, delete: true }}
        toolbar={toolbar}
        showPagination
      />

      {/* ── Add Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Design Model"
        size="medium"
        type="default"
        showCloseButton
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={() => handleSave(false)} loading={saving}>Create</Button>
          </>
        }
      >
        <DesignModelForm form={form} errors={formErrors} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit — ${selected?.name || ''}`}
        size="medium"
        type="default"
        showCloseButton
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={() => handleSave(true)} loading={saving}>Save Changes</Button>
          </>
        }
      >
        <DesignModelForm form={form} errors={formErrors} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
      </Modal>

      {/* ── View / Detail Modal ──────────────────────────────────── */}
      <Modal
        isOpen={viewOpen}
        onClose={() => { setViewOpen(false); setSelected(null); setShowPriceSelector(false); }}
        title={selected?.name || 'Design Model'}
        size="large"
        type="info"
        showCloseButton
      >
        {selected && (
          <div className="dm-detail">

            {/* ── Basic info ──────────────────────────────────── */}
            <div className="dm-section">
              <div className="dm-section-title"><FiInfo size={14} /> Details</div>
              <div className="dm-info-grid">
                <div className="dm-info-row">
                  <span className="dm-info-label">Code</span>
                  <span className="dm-code">{selected.code}</span>
                </div>
                <div className="dm-info-row">
                  <span className="dm-info-label">Designer</span>
                  <span>{selected.designerName || (selected.designerId ? `#${selected.designerId}` : '—')}</span>
                </div>
                <div className="dm-info-row">
                  <span className="dm-info-label">Created</span>
                  <span>{commonLogic.formatDate(selected.createdAt)}</span>
                </div>
                {selected.updatedAt && (
                  <div className="dm-info-row">
                    <span className="dm-info-label">Updated</span>
                    <span>{commonLogic.formatDate(selected.updatedAt)}</span>
                  </div>
                )}
              </div>
              <div className="dm-info-row dm-description-row">
                <span className="dm-info-label">Description</span>
                <span className="dm-description">{selected.description}</span>
              </div>
            </div>

            {/* ── Media ───────────────────────────────────────── */}
            <div className="dm-section">
              <div className="dm-section-header">
                <div className="dm-section-title">
                  <FiImage size={14} />
                  Photos
                  <span className="dm-count-badge">{selected.medias?.length ?? 0}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={mediaUploading ? <FiRefreshCw className="dm-spin" /> : <FiUpload />}
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={mediaUploading}
                  loading={mediaUploading}
                >
                  Add Photo
                </Button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleMediaFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {selected.medias?.length > 0 ? (
                <div className="dm-media-grid">
                  {selected.medias.map(m => (
                    <div key={m.mediaId} className="dm-media-item">
                      <img
                        src={`${API_BASE}/${m.thumbRelativePath || m.relativePath}`}
                        alt={m.altText || m.title || 'Photo'}
                      />
                      <button
                        className="dm-media-remove"
                        onClick={() => handleDetachMedia(m)}
                        disabled={detachingMediaId === m.mediaId}
                        title="Remove photo"
                      >
                        {detachingMediaId === m.mediaId
                          ? <FiRefreshCw size={11} className="dm-spin" />
                          : <FiX size={11} />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dm-empty-section">No photos attached yet.</div>
              )}
            </div>

            {/* ── Order Prices ─────────────────────────────────── */}
            <div className="dm-section">
              <div className="dm-section-header">
                <div className="dm-section-title">
                  <FiDollarSign size={14} />
                  Order Prices
                  <span className="dm-count-badge">{selected.orderPrices?.length ?? 0}</span>
                </div>
                {!showPriceSelector && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<FiLink />}
                    onClick={handleShowPriceSelector}
                  >
                    Link Price
                  </Button>
                )}
              </div>

              {/* Price selector ─────────────────────────────── */}
              {showPriceSelector && (
                <div className="dm-price-selector">
                  {pricesLoading ? (
                    <span className="dm-muted">Loading prices…</span>
                  ) : unlinkedPrices.length === 0 ? (
                    <span className="dm-muted">No available prices to link.</span>
                  ) : (
                    <select
                      className="dm-select"
                      value={selectedPriceId}
                      onChange={e => setSelectedPriceId(e.target.value)}
                    >
                      <option value="">— Select order price —</option>
                      {unlinkedPrices.map(p => (
                        <option key={p.id} value={p.id}>
                          {Number(p.price).toFixed(2)} — {commonLogic.formatDate(p.validFrom)} to {commonLogic.formatDate(p.validTo)}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="dm-price-selector-actions">
                    <Button variant="ghost" size="sm" onClick={() => { setShowPriceSelector(false); setSelectedPriceId(''); }}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAttachPrice}
                      loading={priceAttaching}
                      disabled={!selectedPriceId || priceAttaching}
                    >
                      Link
                    </Button>
                  </div>
                </div>
              )}

              {selected.orderPrices?.length > 0 ? (
                <table className="dm-price-table">
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>Valid From</th>
                      <th>Valid To</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.orderPrices.map(p => {
                      const status = priceStatus(p);
                      return (
                        <tr key={p.orderPriceId}>
                          <td className="dm-price-val">{Number(p.price).toFixed(2)}</td>
                          <td>{commonLogic.formatDate(p.validFrom)}</td>
                          <td>{commonLogic.formatDate(p.validTo)}</td>
                          <td><span className={`dm-badge ${status.cls}`}>{status.label}</span></td>
                          <td>
                            <button
                              className="dm-unlink-btn"
                              onClick={() => handleDetachPrice(p)}
                              disabled={detachingPriceId === p.orderPriceId}
                              title="Unlink price"
                            >
                              {detachingPriceId === p.orderPriceId
                                ? <FiRefreshCw size={12} className="dm-spin" />
                                : <FiTrash2 size={12} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                !showPriceSelector && <div className="dm-empty-section">No order prices linked yet.</div>
              )}
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

export default DesignModels;
