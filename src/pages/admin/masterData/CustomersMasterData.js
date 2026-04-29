import React, { useState, useEffect, useCallback } from 'react';
import {
  FiRefreshCw, FiDownload, FiFilter, FiPlus, FiMinus, FiUser, FiLock,
  FiUnlock, FiMapPin, FiPhone, FiClock, FiTrash2,
  FiEdit2, FiAlertCircle,
} from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import CountrySelect from '../../../components/CountrySelect/CountrySelect';
import { useNotification } from '../../../components/Notification';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
  blockCustomerByAdmin, blockCustomerBySalesman, unblockCustomer, getBlockHistory,
  getCustomerAddresses, addCustomerAddress, updateCustomerAddress, deleteCustomerAddress,
} from '../../../services/api/customersApi';
import { tableHeaderFormat } from '../../../utils/tableHeaderFormat';
import { commonLogic } from '../../../utils/commonLogic';
import { mergeValidationErrorsFromApi, parseApiValidationErrors } from '../../../utils/apiError';
import './CustomersMasterData.css';

const EMPTY_CUSTOMER = {
  isdCode: '+966', mobile: '', firstName: '', lastName: '',
  phone: '', trn: '', city: '', primaryShopId: 0,
};

const EMPTY_ADDRESS = {
  address1: '', address2: '', address3: '', landmark: '',
  city: '', country: '', poBox: '', addressType: 'Home', addressOtherType: '',
};

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

function CustomersMasterData() {
  const { success, error: showError, confirm } = useNotification();
  const { selectedShop, user } = useAuth();

  // List state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal flags
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addrFormOpen, setAddrFormOpen] = useState(false);

  // Selected / form state
  const [selected, setSelected] = useState(null);
  const [addForm, setAddForm] = useState({ ...EMPTY_CUSTOMER });
  const [editForm, setEditForm] = useState({});
  const [blockReason, setBlockReason] = useState('');
  const [blockType, setBlockType] = useState('admin'); // 'admin' | 'salesman'
  const [blockError, setBlockError] = useState('');
  const [blockHistory, setBlockHistory] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDRESS });
  const [editingAddr, setEditingAddr] = useState(null); // address obj being edited

  // Optional address when adding customer
  const [addShowAddr, setAddShowAddr] = useState(false);
  const [addAddrForm, setAddAddrForm] = useState({ ...EMPTY_ADDRESS });
  const [addAddrErrors, setAddAddrErrors] = useState({});

  // Error state
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addrErrors, setAddrErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers(pageNo, pageSize);
      if (res.success) {
        setCustomers(res.data?.data || []);
        setTotalRecords(res.data?.totalRecords ?? 0);
      } else {
        showError(res.message || 'Failed to load customers');
      }
    } catch (e) {
      showError(e.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, showError]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Actions ─────────────────────────────────────────────────────
  const handleAction = async (action, row) => {
    switch (action) {
      case 'view': {
        const res = await getCustomerById(row.id).catch(() => null);
        setSelected(res?.data || row);
        setViewOpen(true);
        break;
      }
      case 'edit': {
        const res = await getCustomerById(row.id).catch(() => null);
        const c = res?.data || row;
        setSelected(c);
        setEditForm({
          isdCode: c.isdCode || '+966', mobile: c.mobile || '',
          firstName: c.firstName || '', lastName: c.lastName || '',
          phone: c.phone || '', trn: c.trn || '',
          city: c.city || '', primaryShopId: c.primaryShopId || selectedShop?.id || 0,
        });
        setEditErrors({});
        setEditOpen(true);
        break;
      }
      case 'delete':
        confirm({
          type: 'danger', title: 'Delete Customer',
          message: `Delete "${row.firstName} ${row.lastName || ''}${row.mobile}"? This cannot be undone.`,
          confirmText: 'Delete', cancelText: 'Cancel',
        }).then(async (ok) => {
          if (!ok) return;
          setLoading(true);
          try {
            const res = await deleteCustomer(row.id);
            if (res.success) { success('Customer deleted'); fetchCustomers(); }
            else showError(res.message || 'Delete failed');
          } catch (e) { showError(e.message || 'Delete failed'); }
          finally { setLoading(false); }
        });
        break;
      case 'blockAdmin':
        setSelected(row);
        setBlockReason('');
        setBlockError('');
        setBlockType('admin');
        setBlockOpen(true);
        break;
      case 'blockSalesman':
        setSelected(row);
        setBlockReason('');
        setBlockError('');
        setBlockType('salesman');
        setBlockOpen(true);
        break;
      case 'unblock':
        confirm({
          type: 'confirm', title: 'Unblock Customer',
          message: `Unblock "${row.firstName} ${row.lastName || ''}"?`,
          confirmText: 'Unblock', cancelText: 'Cancel',
        }).then(async (ok) => {
          if (!ok) return;
          setLoading(true);
          try {
            const res = await unblockCustomer(row.id, user?.id || 0);
            if (res.success) { success('Customer unblocked'); fetchCustomers(); }
            else showError(res.message || 'Unblock failed');
          } catch (e) { showError(e.message || 'Unblock failed'); }
          finally { setLoading(false); }
        });
        break;
      case 'blockHistory': {
        setSelected(row);
        const res = await getBlockHistory(row.id).catch(() => null);
        setBlockHistory(res?.data || []);
        setHistoryOpen(true);
        break;
      }
      case 'addresses': {
        setSelected(row);
        const res = await getCustomerAddresses(row.id).catch(() => null);
        setAddresses(res?.data || []);
        setAddressOpen(true);
        break;
      }
      default: break;
    }
  };

  // ── Reset add form helper ────────────────────────────────────────
  const resetAddForm = () => {
    setAddOpen(false);
    setAddForm({ ...EMPTY_CUSTOMER });
    setAddErrors({});
    setAddShowAddr(false);
    setAddAddrForm({ ...EMPTY_ADDRESS });
    setAddAddrErrors({});
  };

  // ── Add Customer ────────────────────────────────────────────────
  const handleSaveAdd = async () => {
    const errors = {};
    if (!addForm.firstName?.trim()) errors.firstName = 'First name is required';
    if (!addForm.isdCode?.trim()) errors.isdCode = 'ISD code is required';
    if (!addForm.mobile?.trim()) errors.mobile = 'Mobile is required';
    setAddErrors(errors);
    if (Object.keys(errors).length) { showError('Please fix the errors'); return; }

    setSaving(true);
    try {
      const res = await createCustomer({
        ...addForm,
        primaryShopId: selectedShop?.id || addForm.primaryShopId || 0,
      });
      if (res.success) {
        // Optionally save address if user filled it in
        const newId = res.data?.id;
        if (addShowAddr && addAddrForm.address1?.trim() && newId) {
          await addCustomerAddress(newId, { ...addAddrForm, customerId: newId }).catch(() => { });
        }
        success('Customer created');
        resetAddForm();
        fetchCustomers();
      } else {
        // Surface any field-level validation errors from response body
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

  // ── Edit Customer ───────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!selected) return;
    const errors = {};
    if (!editForm.firstName?.trim()) errors.firstName = 'First name is required';
    if (!editForm.isdCode?.trim()) errors.isdCode = 'ISD code is required';
    if (!editForm.mobile?.trim()) errors.mobile = 'Mobile is required';
    setEditErrors(errors);
    if (Object.keys(errors).length) { showError('Please fix the errors'); return; }

    setSaving(true);
    try {
      const res = await updateCustomer(selected.id, {
        ...editForm,
        primaryShopId: editForm.primaryShopId || selectedShop?.id || 0,
      });
      if (res.success) {
        success('Customer updated');
        setEditOpen(false);
        setSelected(null);
        setEditErrors({});
        fetchCustomers();
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

  // ── Block Customer ──────────────────────────────────────────────
  const handleBlock = async () => {
    if (!blockReason.trim()) { setBlockError('Block reason is required'); return; }
    setBlockError('');
    setSaving(true);
    try {
      const isAdmin = blockType === 'admin';
      const payload = isAdmin
        ? { customerId: selected.id, reason: blockReason }
        : { customerId: selected.id, reason: blockReason };

      const res = isAdmin
        ? await blockCustomerByAdmin(payload)
        : await blockCustomerBySalesman(payload);

      if (res.success) {
        success('Customer blocked');
        setBlockOpen(false);
        setBlockReason('');
        setBlockError('');
        fetchCustomers();
      } else {
        setBlockError(res.message || 'Block failed');
      }
    } catch (e) {
      setBlockError(e.message || 'Block failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Address CRUD ────────────────────────────────────────────────
  const openAddAddress = () => {
    setEditingAddr(null);
    setAddrForm({ ...EMPTY_ADDRESS });
    setAddrErrors({});
    setAddrFormOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      address1: addr.address1 || '', address2: addr.address2 || '',
      address3: addr.address3 || '', landmark: addr.landmark || '',
      city: addr.city || '', country: addr.country || '',
      poBox: addr.poBox || '', addressType: addr.addressType || 'Home',
      addressOtherType: addr.addressOtherType || '',
    });
    setAddrErrors({});
    setAddrFormOpen(true);
  };

  const handleSaveAddress = async () => {
    const errors = {};
    if (!addrForm.address1?.trim()) errors.address1 = 'Address line 1 is required';
    setAddrErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      const res = editingAddr
        ? await updateCustomerAddress(selected.id, editingAddr.id, { ...addrForm, customerId: selected.id })
        : await addCustomerAddress(selected.id, { ...addrForm, customerId: selected.id });
      if (res.success) {
        success(editingAddr ? 'Address updated' : 'Address added');
        const fresh = await getCustomerAddresses(selected.id).catch(() => null);
        setAddresses(fresh?.data || []);
        setAddrFormOpen(false);
      } else {
        showError(res.message || 'Save failed');
      }
    } catch (e) {
      showError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (addr) => {
    confirm({
      type: 'danger', title: 'Delete Address',
      message: `Delete address "${addr.address1}"?`,
      confirmText: 'Delete', cancelText: 'Cancel',
    }).then(async (ok) => {
      if (!ok) return;
      try {
        const res = await deleteCustomerAddress(selected.id, addr.id);
        if (res.success) {
          success('Address deleted');
          setAddresses(prev => prev.filter(a => a.id !== addr.id));
        } else {
          showError(res.message || 'Delete failed');
        }
      } catch (e) {
        showError(e.message || 'Delete failed');
      }
    });
  };

  // ── Toolbar ─────────────────────────────────────────────────────
  const toolbar = (
    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', background: 'var(--bg-primary)' }}>
        <Button variant="ghost" icon={<FiFilter />} title="Filter" />
        <Button variant="ghost" icon={<FiDownload />} title="Export" />
        <Button variant="ghost" icon={<FiRefreshCw />} onClick={fetchCustomers} loading={loading} disabled={loading} title="Reload" />
        <Button variant="ghost" icon={<FiPlus />} onClick={() => { setAddForm({ ...EMPTY_CUSTOMER }); setAddErrors({}); setAddOpen(true); }} title="Add Customer" />
      </div>
    </div>
  );

  return (
    <div className="cust-master">
      <DataGrid
        data={customers}
        columns={tableHeaderFormat.customerData}
        onAction={handleAction}
        loading={loading}
        pageSize={pageSize}
        serverSide
        page={pageNo}
        totalRecords={totalRecords}
        onPageChange={setPageNo}
        printTitle="Customers"
        searchPlaceholder="Search customers..."
        emptyMessage="No customers found"
        defaultActions={{ view: true, edit: true, delete: true }}
        actionMenuItems={[
          { id: 'blockAdmin', label: 'Block (Admin)', icon: <FiLock />, action: 'blockAdmin', visible: (r) => !r.isBlocked },
          { id: 'blockSalesman', label: 'Block (Salesman)', icon: <FiLock />, action: 'blockSalesman', visible: (r) => !r.isBlocked },
          { id: 'unblock', label: 'Unblock', icon: <FiUnlock />, action: 'unblock', visible: (r) => r.isBlocked },
          { id: 'addresses', label: 'Addresses', icon: <FiMapPin />, action: 'addresses', visible: () => true },
          { id: 'blockHistory', label: 'Block History', icon: <FiClock />, action: 'blockHistory', visible: () => true },
        ]}
        toolbar={toolbar}
      />

      {/* ── View Modal ──────────────────────────────────────────── */}
      <Modal isOpen={viewOpen} onClose={() => { setViewOpen(false); setSelected(null); }}
        title="Customer Details" size="medium" type="info" showCloseButton>
        {selected && (
          <div className="cust-detail-grid">
            <Detail label="ID" value={selected.id} />
            <Detail label="First Name" value={selected.firstName} />
            <Detail label="Last Name" value={selected.lastName || '—'} />
            <Detail label="Mobile" value={selected.fullMobileNumber || `${selected.isdCode}${selected.mobile}`} />
            <Detail label="Phone" value={selected.phone || '—'} />
            <Detail label="City" value={selected.city || '—'} />
            <Detail label="TRN" value={selected.trn || '—'} />
            <Detail label="Status" value={selected.isBlocked ? 'Blocked' : 'Active'} valueColor={selected.isBlocked ? 'var(--danger-color)' : 'var(--success-color)'} />
            <Detail label="Created" value={commonLogic.formatDate(selected.createdAt)} />
          </div>
        )}
      </Modal>

      {/* ── Add Modal ───────────────────────────────────────────── */}
      <Modal isOpen={addOpen} onClose={resetAddForm}
        title="Add Customer" size="medium" loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: resetAddForm, variant: 'secondary', disabled: saving },
          { label: 'Create Customer', onClick: handleSaveAdd, variant: 'primary', disabled: saving },
        ]}>
        <CustomerForm form={addForm} setForm={setAddForm} errors={addErrors} setErrors={setAddErrors} />
        <div className="cust-optional-addr-section">
          <button type="button" className="cust-toggle-addr-btn"
            onClick={() => setAddShowAddr(v => !v)}>
            {addShowAddr ? <FiMinus size={14} /> : <FiPlus size={14} />}
            {addShowAddr ? 'Remove address' : 'Add address (optional)'}
          </button>
          {addShowAddr && (
            <div className="cust-optional-addr-form">
              <AddressForm form={addAddrForm} setForm={setAddAddrForm} errors={addAddrErrors} setErrors={setAddAddrErrors} />
            </div>
          )}
        </div>
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────── */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Customer" size="medium" loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => { setEditOpen(false); setSelected(null); }, variant: 'secondary', disabled: saving },
          { label: 'Save Changes', onClick: handleSaveEdit, variant: 'primary', disabled: saving },
        ]}>
        <CustomerForm form={editForm} setForm={setEditForm} errors={editErrors} setErrors={setEditErrors} />
      </Modal>

      {/* ── Block Modal ─────────────────────────────────────────── */}
      <Modal isOpen={blockOpen} onClose={() => { setBlockOpen(false); setBlockReason(''); setBlockError(''); }}
        title={`Block Customer — ${selected?.firstName || ''}`}
        size="large" type="warning" loading={saving}
        closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => { setBlockOpen(false); setBlockReason(''); setBlockError(''); }, variant: 'secondary', disabled: saving },
          { label: blockType === 'admin' ? 'Block by Admin' : 'Block by Salesman', onClick: handleBlock, variant: 'danger', disabled: saving },
        ]}>
        <div className="cust-block-type-row">
          <span className={`cust-block-type-badge cust-block-type-badge--${blockType}`}>
            <FiLock size={12} />
            {blockType === 'admin' ? 'Admin Block' : 'Salesman Block'}
          </span>
        </div>
        <div className="form-group">
          <TextBox
            label={blockType === 'admin' ? 'Admin Remark' : 'Salesman Remark'} required
            placeholder={`Enter reason for ${blockType === 'admin' ? 'admin' : 'salesman'} block...`}
            value={blockReason}
            onChange={e => { setBlockReason(e.target.value); if (blockError) setBlockError(''); }}
            leftIcon={<FiAlertCircle />}
            error={blockError}
          />
        </div>
      </Modal>

      {/* ── Block History Modal ─────────────────────────────────── */}
      <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)}
        title={`Block History — ${selected?.firstName || ''}`}
        size="large" type="default" showCloseButton>
        {blockHistory.length === 0
          ? <p className="cust-empty">No block history found.</p>
          : (
            <div className="cust-history-list">
              {blockHistory.map((h, i) => (
                <div key={h.id || i} className={`cust-history-card ${h.isAdminUnblocked ? 'cust-history-card--unblocked' : 'cust-history-card--blocked'}`}>
                  <div className="cust-history-card__header">
                    <span className={`cust-history-badge ${h.isAdminUnblocked ? 'cust-history-badge--green' : 'cust-history-badge--red'}`}>
                      {h.isAdminUnblocked ? 'Unblocked' : h.isAdminBlocked ? 'Admin Blocked' : 'Salesman Blocked'}
                    </span>
                    <span className="cust-history-date">{commonLogic.formatDate(h.blockBySalesmanDate)}</span>
                  </div>
                  {h.salesmanRemark && <p className="cust-history-remark"><strong>Salesman:</strong> {h.salesmanRemark}</p>}
                  {h.adminRemark && <p className="cust-history-remark"><strong>Admin:</strong> {h.adminRemark}</p>}
                  {h.unblockByAdminDate && <p className="cust-history-remark cust-history-remark--muted">Unblocked: {commonLogic.formatDate(h.unblockByAdminDate)}</p>}
                </div>
              ))}
            </div>
          )}
      </Modal>

      {/* ── Addresses Modal ─────────────────────────────────────── */}
      <Modal isOpen={addressOpen} onClose={() => setAddressOpen(false)}
        title={`Addresses — ${selected?.firstName || ''}`}
        size="large" type="default" showCloseButton
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="primary" icon={<FiPlus />} onClick={openAddAddress}>Add Address</Button>
          </div>
        }>
        {addresses.length === 0
          ? <p className="cust-empty">No addresses saved.</p>
          : (
            <div className="cust-addr-list">
              {addresses.map(addr => (
                <div key={addr.id} className="cust-addr-card">
                  <div className="cust-addr-card__type">
                    <FiMapPin size={13} /> {addr.addressType}
                    {addr.addressType === 'Other' && addr.addressOtherType ? ` (${addr.addressOtherType})` : ''}
                  </div>
                  <div className="cust-addr-card__lines">
                    <span>{addr.address1}</span>
                    {addr.address2 && <span>{addr.address2}</span>}
                    {addr.address3 && <span>{addr.address3}</span>}
                    {addr.landmark && <span className="cust-addr-landmark">Near: {addr.landmark}</span>}
                    <span>{[addr.city, addr.country, addr.poBox].filter(Boolean).join(', ')}</span>
                  </div>
                  <div className="cust-addr-card__actions">
                    <button className="cust-addr-btn" onClick={() => openEditAddress(addr)}><FiEdit2 size={14} /></button>
                    <button className="cust-addr-btn cust-addr-btn--danger" onClick={() => handleDeleteAddress(addr)}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Modal>

      {/* ── Address Form Modal ───────────────────────────────────── */}
      <Modal isOpen={addrFormOpen} onClose={() => setAddrFormOpen(false)}
        title={editingAddr ? 'Edit Address' : 'Add Address'}
        size="medium" loading={saving} closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => setAddrFormOpen(false), variant: 'secondary', disabled: saving },
          { label: 'Save Address', onClick: handleSaveAddress, variant: 'primary', disabled: saving },
        ]}>
        <AddressForm form={addrForm} setForm={setAddrForm} errors={addrErrors} setErrors={setAddrErrors} />
      </Modal>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────
function Detail({ label, value, valueColor }) {
  return (
    <div className="cust-detail-row">
      <span className="cust-detail-label">{label}</span>
      <span className="cust-detail-value" style={valueColor ? { color: valueColor, fontWeight: 600 } : undefined}>{value}</span>
    </div>
  );
}

function CustomerForm({ form, setForm, errors, setErrors }) {
  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };
  return (
    <div className="modal-form">
      <div className="cust-form-row">
        <div className="form-group">
          <TextBox label="First Name" required leftIcon={<FiUser />}
            value={form.firstName} onChange={e => set('firstName', e.target.value)}
            placeholder="Enter first name" error={errors.firstName} />
        </div>
        <div className="form-group">
          <TextBox label="Last Name" leftIcon={<FiUser />}
            value={form.lastName} onChange={e => set('lastName', e.target.value)}
            placeholder="Enter last name" />
        </div>
      </div>
      <div className="cust-form-row">
        <div className="form-group">
          <CountrySelect label="ISD Code" required showFlag showISD
            value={form.isdCode}
            onChange={e => set('isdCode', e.isd)}
            error={errors.isdCode} />
        </div>
        <div className="form-group">
          <TextBox label="Mobile" required type="tel" leftIcon={<FiPhone />}
            value={form.mobile} onChange={e => set('mobile', e.target.value)}
            placeholder="Mobile number" error={errors.mobile} />
        </div>
      </div>
      <div className="form-group">
        <TextBox label="Phone (Landline)" type="tel" leftIcon={<FiPhone />}
          value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="Landline (optional)" />
      </div>
      <div className="cust-form-row">
        <div className="form-group">
          <TextBox label="City"
            value={form.city} onChange={e => set('city', e.target.value)}
            placeholder="City (optional)" />
        </div>
        <div className="form-group">
          <TextBox label="TRN"
            value={form.trn} onChange={e => set('trn', e.target.value)}
            placeholder="Tax Reg. No. (optional)" />
        </div>
      </div>
    </div>
  );
}

function AddressForm({ form, setForm, errors, setErrors }) {
  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };
  return (
    <div className="modal-form">
      <div className="form-group">
        <TextBox label="Address Line 1" required
          value={form.address1} onChange={e => set('address1', e.target.value)}
          placeholder="Building / Street" error={errors.address1} />
      </div>
      <div className="form-group">
        <TextBox label="Address Line 2"
          value={form.address2} onChange={e => set('address2', e.target.value)}
          placeholder="Area / Block" />
      </div>
      <div className="form-group">
        <TextBox label="Address Line 3"
          value={form.address3} onChange={e => set('address3', e.target.value)}
          placeholder="Additional info (optional)" />
      </div>
      <div className="cust-form-row">
        <div className="form-group">
          <TextBox label="City"
            value={form.city} onChange={e => set('city', e.target.value)}
            placeholder="City" />
        </div>
        <div className="form-group">
          <TextBox label="Country"
            value={form.country} onChange={e => set('country', e.target.value)}
            placeholder="Country" />
        </div>
      </div>
      <div className="cust-form-row">
        <div className="form-group">
          <TextBox label="Landmark"
            value={form.landmark} onChange={e => set('landmark', e.target.value)}
            placeholder="Near landmark (optional)" />
        </div>
        <div className="form-group">
          <TextBox label="P.O. Box"
            value={form.poBox} onChange={e => set('poBox', e.target.value)}
            placeholder="P.O. Box (optional)" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address Type</label>
        <div className="cust-addr-type-btns">
          {ADDRESS_TYPES.map(t => (
            <button key={t} type="button"
              className={`cust-addr-type-btn ${form.addressType === t ? 'cust-addr-type-btn--active' : ''}`}
              onClick={() => set('addressType', t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {form.addressType === 'Other' && (
        <div className="form-group">
          <TextBox label="Specify Type"
            value={form.addressOtherType} onChange={e => set('addressOtherType', e.target.value)}
            placeholder="e.g. Warehouse, Villa..." />
        </div>
      )}
    </div>
  );
}

export default CustomersMasterData;
