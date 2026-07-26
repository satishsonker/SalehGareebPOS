import React, { useState, useEffect, useCallback } from 'react';
import {
  FiRefreshCw, FiPlus, FiFilter, FiDownload,
  FiBell, FiSend, FiAlertCircle, FiInfo, FiCheckCircle, FiAlertTriangle,
} from 'react-icons/fi';
import DataGrid from '../../components/DataGrid';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import TextBox from '../../components/TextBox/TextBox';
import Select from '../../components/Select/Select';
import Switch from '../../components/Switch/Switch';
import { useNotification } from '../../components/Notification';
import {
  getSystemNotifications, getSystemNotificationById,
  createSystemNotification, updateSystemNotification,
  deleteSystemNotification, sendSystemNotification,
} from '../../services/api/systemNotificationApi';
import { tableHeaderFormat } from '../../utils/tableHeaderFormat';
import { commonLogic } from '../../utils/commonLogic';
import { mergeValidationErrorsFromApi, parseApiValidationErrors } from '../../utils/apiError';
import './SystemNotifications.css';

const NOTIFICATION_TYPES = [
  { value: 'Info',         label: 'Info' },
  { value: 'Warning',      label: 'Warning' },
  { value: 'Success',      label: 'Success' },
  { value: 'Error',        label: 'Error' },
  { value: 'Announcement', label: 'Announcement' },
];

const AUDIENCE_OPTIONS = [
  { value: 'All',       label: 'All Users' },
  { value: 'Admins',    label: 'Admins Only' },
  { value: 'Customers', label: 'Customers Only' },
];

const EMPTY_FORM = {
  title: '',
  message: '',
  notificationType: 'Info',
  targetAudience: 'All',
  scheduledAt: '',
  isActive: true,
};

const TYPE_ICON = {
  Info:         <FiInfo />,
  Warning:      <FiAlertTriangle />,
  Success:      <FiCheckCircle />,
  Error:        <FiAlertCircle />,
  Announcement: <FiBell />,
};

function SystemNotifications() {
  const { success, error: showError, confirm } = useNotification();

  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [pageNo, setPageNo]             = useState(1);
  const [pageSize]                      = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [viewOpen, setViewOpen]   = useState(false);
  const [addOpen, setAddOpen]     = useState(false);
  const [editOpen, setEditOpen]   = useState(false);

  const [selected, setSelected]     = useState(null);
  const [addForm, setAddForm]       = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm]     = useState({ ...EMPTY_FORM });
  const [addErrors, setAddErrors]   = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving]         = useState(false);
  const [sending, setSending]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSystemNotifications(pageNo, pageSize);
      if (res.success) {
        setItems(res.data?.data || []);
        setTotalRecords(res.data?.totalRecords ?? 0);
      } else {
        showError(res.message || 'Failed to load notifications');
      }
    } catch (e) {
      showError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, showError]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Validation ──────────────────────────────────────────────────
  const validate = (form) => {
    const errors = {};
    if (!form.title?.trim())   errors.title   = 'Title is required';
    if (!form.message?.trim()) errors.message = 'Message is required';
    if (!form.notificationType) errors.notificationType = 'Type is required';
    return errors;
  };

  // ── Actions ────────────────────────────────────────────────────
  const handleAction = async (action, row) => {
    switch (action) {
      case 'view': {
        const res = await getSystemNotificationById(row.id).catch(() => null);
        setSelected(res?.data || row);
        setViewOpen(true);
        break;
      }
      case 'edit': {
        const res = await getSystemNotificationById(row.id).catch(() => null);
        const d = res?.data || row;
        setSelected(d);
        setEditForm({
          title:            d.title || '',
          message:          d.message || '',
          notificationType: d.notificationType || 'Info',
          targetAudience:   d.targetAudience || 'All',
          scheduledAt:      d.scheduledAt ? d.scheduledAt.substring(0, 16) : '',
          isActive:         d.isActive ?? true,
        });
        setEditErrors({});
        setEditOpen(true);
        break;
      }
      case 'delete':
        confirm({
          type: 'danger',
          title: 'Delete Notification',
          message: `Delete "${row.title}"? This cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }).then(async (ok) => {
          if (!ok) return;
          setLoading(true);
          try {
            const res = await deleteSystemNotification(row.id);
            if (res.success) { success('Notification deleted'); fetchItems(); }
            else showError(res.message || 'Delete failed');
          } catch (e) { showError(e.message || 'Delete failed'); }
          finally { setLoading(false); }
        });
        break;
      case 'send':
        confirm({
          type: 'confirm',
          title: 'Send Notification',
          message: `Send "${row.title}" to ${row.targetAudience || 'all users'} now?`,
          confirmText: 'Send',
          cancelText: 'Cancel',
        }).then(async (ok) => {
          if (!ok) return;
          setSending(true);
          try {
            const res = await sendSystemNotification(row.id);
            if (res.success) { success('Notification sent successfully'); fetchItems(); }
            else showError(res.message || 'Send failed');
          } catch (e) { showError(e.message || 'Send failed'); }
          finally { setSending(false); }
        });
        break;
      default: break;
    }
  };

  // ── Add ────────────────────────────────────────────────────────
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
      const res = await createSystemNotification({
        ...addForm,
        scheduledAt: addForm.scheduledAt || null,
      });
      if (res.success) {
        success('Notification created');
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

  // ── Edit ───────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!selected) return;
    const errors = validate(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length) { showError('Please fix the errors'); return; }

    setSaving(true);
    try {
      const res = await updateSystemNotification(selected.id, {
        ...editForm,
        scheduledAt: editForm.scheduledAt || null,
      });
      if (res.success) {
        success('Notification updated');
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

  // ── Toolbar ────────────────────────────────────────────────────
  const toolbar = (
    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', background: 'var(--bg-primary)' }}>
        <Button variant="ghost" icon={<FiFilter />}    title="Filter" />
        <Button variant="ghost" icon={<FiDownload />}  title="Export" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={fetchItems} loading={loading} disabled={loading} title="Reload" />
      </div>
      <Button variant="primary" icon={<FiPlus />} onClick={openAdd}>
        Add Notification
      </Button>
    </div>
  );

  return (
    <div className="admin-page">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <FiBell className="page-icon" />
          <h2>System Notifications</h2>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <DataGrid
        data={items}
        columns={tableHeaderFormat.systemNotificationData}
        onAction={handleAction}
        loading={loading || sending}
        pageSize={pageSize}
        serverSide
        page={pageNo}
        totalRecords={totalRecords}
        onPageChange={setPageNo}
        printTitle="System Notifications"
        searchPlaceholder="Search notifications..."
        emptyMessage="No notifications found"
        defaultActions={{ view: true, edit: true, delete: true }}
        actionMenuItems={[
          {
            id: 'send',
            label: 'Send Now',
            icon: <FiSend />,
            action: 'send',
            visible: (r) => !r.isSent,
          },
        ]}
        toolbar={toolbar}
        showPagination
      />

      {/* ── View Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={viewOpen}
        onClose={() => { setViewOpen(false); setSelected(null); }}
        title="Notification Details"
        size="medium"
        type="info"
        showCloseButton
      >
        {selected && (
          <div className="modal-form">
            <div className="sn-type-row">
              <span className={`sn-type-badge sn-type-badge--${(selected.notificationType || 'info').toLowerCase()}`}>
                {TYPE_ICON[selected.notificationType] || <FiBell />}
                {selected.notificationType || 'Info'}
              </span>
              <span className={`sn-status-badge ${selected.isSent ? 'sn-status-badge--sent' : selected.scheduledAt ? 'sn-status-badge--scheduled' : 'sn-status-badge--draft'}`}>
                {selected.isSent ? 'Sent' : selected.scheduledAt ? 'Scheduled' : 'Draft'}
              </span>
            </div>

            <div className="detail-row">
              <label>Title</label>
              <span>{selected.title}</span>
            </div>
            <div className="detail-row">
              <label>Message</label>
              <span className="sn-detail-message">{selected.message}</span>
            </div>
            <div className="detail-row">
              <label>Audience</label>
              <span>{selected.targetAudience || 'All'}</span>
            </div>
            {selected.scheduledAt && (
              <div className="detail-row">
                <label>Scheduled At</label>
                <span>{commonLogic.formatDate(selected.scheduledAt)}</span>
              </div>
            )}
            {selected.sentAt && (
              <div className="detail-row">
                <label>Sent At</label>
                <span>{commonLogic.formatDate(selected.sentAt)}</span>
              </div>
            )}
            <div className="detail-row">
              <label>Created</label>
              <span>{commonLogic.formatDate(selected.createdAt)}</span>
            </div>
            <div className="detail-row">
              <label>Active</label>
              <span style={{ color: selected.isActive ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 600 }}>
                {selected.isActive ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Notification"
        size="medium"
        loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel',      onClick: () => setAddOpen(false), variant: 'secondary', disabled: saving },
          { label: 'Create',      onClick: handleSaveAdd,           variant: 'primary',   disabled: saving },
        ]}
      >
        <NotificationForm
          form={addForm}
          setForm={setAddForm}
          errors={addErrors}
          setErrors={setAddErrors}
        />
      </Modal>

      {/* ── Edit Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Notification"
        size="medium"
        loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel',       onClick: () => { setEditOpen(false); setSelected(null); }, variant: 'secondary', disabled: saving },
          { label: 'Save Changes', onClick: handleSaveEdit,                                   variant: 'primary',   disabled: saving },
        ]}
      >
        <NotificationForm
          form={editForm}
          setForm={setEditForm}
          errors={editErrors}
          setErrors={setEditErrors}
        />
      </Modal>
    </div>
  );
}

// ── Form sub-component ────────────────────────────────────────────
function NotificationForm({ form, setForm, errors, setErrors }) {
  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  return (
    <div className="modal-form">
      {/* Title */}
      <div className="form-group">
        <TextBox
          label="Title" required
          leftIcon={<FiBell />}
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Enter notification title"
          error={errors.title}
        />
      </div>

      {/* Message */}
      <div className="form-group">
        <label className="sn-form-label">
          Message <span className="sn-required">*</span>
        </label>
        <textarea
          className={`sn-textarea${errors.message ? ' sn-textarea--error' : ''}`}
          rows={4}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Enter notification message..."
        />
        {errors.message && <span className="sn-field-error">{errors.message}</span>}
      </div>

      {/* Type & Audience */}
      <div className="sn-form-row">
        <div className="form-group">
          <Select
            label="Type" required
            options={NOTIFICATION_TYPES}
            value={form.notificationType}
            onChange={val => set('notificationType', val)}
            error={errors.notificationType}
            placeholder="Select type..."
          />
        </div>
        <div className="form-group">
          <Select
            label="Target Audience"
            options={AUDIENCE_OPTIONS}
            value={form.targetAudience}
            onChange={val => set('targetAudience', val)}
            placeholder="Select audience..."
          />
        </div>
      </div>

      {/* Scheduled At */}
      <div className="form-group">
        <TextBox
          label="Schedule At (optional)"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={e => set('scheduledAt', e.target.value)}
          helperText="Leave blank to save as draft"
        />
      </div>

      {/* Active */}
      <div className="form-group">
        <Switch
          id="sn-isActive"
          label="Active"
          labelPosition="left"
          checked={form.isActive}
          onChange={val => set('isActive', val)}
          onLabel="YES"
          offLabel="NO"
          size="large"
        />
      </div>
    </div>
  );
}

export default SystemNotifications;
