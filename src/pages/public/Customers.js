import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiPlus, FiUser, FiPhone, FiMapPin,
  FiChevronRight, FiEdit2, FiTrash2, FiLock, FiUnlock, FiX, FiCheck,
} from 'react-icons/fi';
import Modal from '../../components/Modal/Modal';
import TextBox from '../../components/TextBox/TextBox';
import CountrySelect from '../../components/CountrySelect/CountrySelect';
import { useNotification } from '../../components/Notification';
import { useAuth } from '../../contexts/AuthContext';
import {
  searchCustomers, getCustomerById, createCustomer, updateCustomer,
  getCustomerAddresses, addCustomerAddress, updateCustomerAddress, deleteCustomerAddress,
} from '../../services/api/customersApi';
import { commonLogic } from '../../utils/commonLogic';
import { mergeValidationErrorsFromApi } from '../../utils/apiError';
import './Customers.css';

const EMPTY_CUSTOMER = {
  isdCode: '+966', mobile: '', firstName: '', lastName: '',
  phone: '', trn: '', city: '', primaryShopId: 0,
};

const EMPTY_ADDRESS = {
  address1: '', address2: '', address3: '', landmark: '',
  city: '', country: '', poBox: '', addressType: 'Home', addressOtherType: '',
};

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

// ── Customer row card ─────────────────────────────────────────────
function CustomerCard({ customer, onClick }) {
  return (
    <div className={`pub-cust-card ${customer.isBlocked ? 'pub-cust-card--blocked' : ''}`} onClick={() => onClick(customer)}>
      <div className="pub-cust-card__avatar">
        {(customer.firstName?.[0] || '?').toUpperCase()}
      </div>
      <div className="pub-cust-card__body">
        <div className="pub-cust-card__name">
          {customer.firstName} {customer.lastName || ''}
          {customer.isBlocked && <span className="pub-cust-badge pub-cust-badge--blocked">Blocked</span>}
        </div>
        <div className="pub-cust-card__meta">
          <span><FiPhone size={11} /> {customer.fullMobileNumber || `${customer.isdCode}${customer.mobile}`}</span>
          {customer.city && <span><FiMapPin size={11} /> {customer.city}</span>}
        </div>
      </div>
      <FiChevronRight className="pub-cust-card__arrow" size={16} />
    </div>
  );
}

// ── Detail field ──────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return value ? (
    <div className="pub-cust-detail-row">
      <span className="pub-cust-detail-label">{label}</span>
      <span className="pub-cust-detail-value">{value}</span>
    </div>
  ) : null;
}

// ── Main ──────────────────────────────────────────────────────────
function Customers() {
  const navigate = useNavigate();
  const { selectedShop, user } = useAuth();
  const { success, error: showError, confirm } = useNotification();

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // Selected customer
  const [selected, setSelected] = useState(null);
  const [addresses, setAddresses] = useState([]);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({ ...EMPTY_CUSTOMER });
  const [editForm, setEditForm] = useState({});
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDRESS });

  // Errors / saving
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addrErrors, setAddrErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Search ────────────────────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchCustomers(q);
      setResults(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  // ── Select customer ───────────────────────────────────────────
  const handleSelect = async (cust) => {
    const res = await getCustomerById(cust.id).catch(() => null);
    const full = res?.data || cust;
    setSelected(full);
    const addrRes = await getCustomerAddresses(cust.id).catch(() => null);
    setAddresses(addrRes?.data || []);
  };

  const handleBack = () => setSelected(null);

  // ── Add Customer ──────────────────────────────────────────────
  const handleSaveAdd = async () => {
    const errors = {};
    if (!addForm.firstName?.trim()) errors.firstName = 'Required';
    if (!addForm.isdCode?.trim()) errors.isdCode = 'Required';
    if (!addForm.mobile?.trim()) errors.mobile = 'Required';
    setAddErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      const res = await createCustomer({ ...addForm, primaryShopId: selectedShop?.id || 0 });
      if (res.success) {
        success('Customer created');
        setAddOpen(false);
        setAddForm({ ...EMPTY_CUSTOMER });
        setAddErrors({});
        // Auto-open the new customer
        if (res.data?.id) await handleSelect(res.data);
        doSearch(query);
      } else {
        showError(res.message || 'Create failed');
      }
    } catch (e) {
      mergeValidationErrorsFromApi(e, setAddErrors);
      showError(e.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Customer ─────────────────────────────────────────────
  const openEdit = () => {
    setEditForm({
      isdCode: selected.isdCode || '+966', mobile: selected.mobile || '',
      firstName: selected.firstName || '', lastName: selected.lastName || '',
      phone: selected.phone || '', trn: selected.trn || '',
      city: selected.city || '', primaryShopId: selected.primaryShopId || selectedShop?.id || 0,
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const errors = {};
    if (!editForm.firstName?.trim()) errors.firstName = 'Required';
    if (!editForm.isdCode?.trim()) errors.isdCode = 'Required';
    if (!editForm.mobile?.trim()) errors.mobile = 'Required';
    setEditErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      const res = await updateCustomer(selected.id, editForm);
      if (res.success) {
        success('Customer updated');
        setEditOpen(false);
        setSelected(res.data || { ...selected, ...editForm });
        doSearch(query);
      } else {
        showError(res.message || 'Update failed');
      }
    } catch (e) {
      mergeValidationErrorsFromApi(e, setEditErrors);
      showError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Address CRUD ──────────────────────────────────────────────
  const openAddAddr = () => { setEditingAddr(null); setAddrForm({ ...EMPTY_ADDRESS }); setAddrErrors({}); setAddrFormOpen(true); };
  const openEditAddr = (addr) => {
    setEditingAddr(addr);
    setAddrForm({ address1: addr.address1 || '', address2: addr.address2 || '', address3: addr.address3 || '', landmark: addr.landmark || '', city: addr.city || '', country: addr.country || '', poBox: addr.poBox || '', addressType: addr.addressType || 'Home', addressOtherType: addr.addressOtherType || '' });
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
    confirm({ type: 'danger', title: 'Delete Address', message: `Delete "${addr.address1}"?`, confirmText: 'Delete', cancelText: 'Cancel' })
      .then(async (ok) => {
        if (!ok) return;
        const res = await deleteCustomerAddress(selected.id, addr.id).catch(() => null);
        if (res?.success) { success('Deleted'); setAddresses(p => p.filter(a => a.id !== addr.id)); }
        else showError('Delete failed');
      });
  };

  // ── Customer detail view ──────────────────────────────────────
  if (selected) {
    return (
      <div className="pub-cust-root">
        {/* Header */}
        <div className="pub-cust-header">
          <button className="pub-cust-back" onClick={handleBack}><FiArrowLeft size={18} /></button>
          <div className="pub-cust-header__icon" style={{ background: '#2563eb' }}><FiUser size={20} /></div>
          <h1 className="pub-cust-header__title">{selected.firstName} {selected.lastName || ''}</h1>
          <div className="pub-cust-header__actions">
            <button className="pub-cust-action-btn" onClick={openEdit} title="Edit"><FiEdit2 size={16} /></button>
          </div>
        </div>

        <div className="pub-cust-detail-body">
          {/* Info card */}
          <div className="pub-cust-section">
            <h3 className="pub-cust-section__title"><FiUser size={14} /> Customer Info</h3>
            {selected.isBlocked && (
              <div className="pub-cust-blocked-banner">
                <FiLock size={14} /> This customer is currently blocked
              </div>
            )}
            <div className="pub-cust-info-grid">
              <DetailRow label="Mobile" value={selected.fullMobileNumber || `${selected.isdCode}${selected.mobile}`} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="City" value={selected.city} />
              <DetailRow label="TRN" value={selected.trn} />
              <DetailRow label="Created" value={commonLogic.formatDate(selected.createdAt)} />
            </div>
          </div>

          {/* Addresses */}
          <div className="pub-cust-section">
            <div className="pub-cust-section__header">
              <h3 className="pub-cust-section__title"><FiMapPin size={14} /> Addresses</h3>
              <button className="pub-cust-mini-btn" onClick={() => { setAddrOpen(true); }}>
                <FiPlus size={13} /> Add
              </button>
            </div>
            {addresses.length === 0
              ? <p className="pub-cust-empty">No addresses saved.</p>
              : (
                <div className="pub-cust-addr-list">
                  {addresses.map(addr => (
                    <div key={addr.id} className="pub-cust-addr-card">
                      <div className="pub-cust-addr-card__type">{addr.addressType}</div>
                      <div className="pub-cust-addr-card__lines">
                        <span>{addr.address1}</span>
                        {addr.address2 && <span>{addr.address2}</span>}
                        {addr.landmark && <span className="pub-cust-addr-muted">Near: {addr.landmark}</span>}
                        <span>{[addr.city, addr.country].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="pub-cust-addr-actions">
                        <button className="pub-cust-addr-btn" onClick={() => openEditAddr(addr)}><FiEdit2 size={13} /></button>
                        <button className="pub-cust-addr-btn pub-cust-addr-btn--danger" onClick={() => handleDeleteAddress(addr)}><FiTrash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer"
          size="medium" loading={saving} closeOnOverlayClick={!saving}
          actions={[
            { label: 'Cancel', onClick: () => setEditOpen(false), variant: 'secondary', disabled: saving },
            { label: 'Save Changes', onClick: handleSaveEdit, variant: 'primary', disabled: saving },
          ]}>
          <PubCustomerForm form={editForm} setForm={setEditForm} errors={editErrors} setErrors={setEditErrors} />
        </Modal>

        {/* Address list modal — shortcut to form */}
        <Modal isOpen={addrOpen} onClose={() => setAddrOpen(false)} title="Add Address"
          size="medium" loading={saving} closeOnOverlayClick={!saving}
          actions={[
            { label: 'Cancel', onClick: () => setAddrOpen(false), variant: 'secondary', disabled: saving },
            { label: 'Save Address', onClick: handleSaveAddress, variant: 'primary', disabled: saving },
          ]}>
          <AddressForm form={addrForm} setForm={setAddrForm} errors={addrErrors} setErrors={setAddrErrors} />
        </Modal>

        {/* Address edit modal */}
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

  // ── Search / list view ────────────────────────────────────────
  return (
    <div className="pub-cust-root">
      {/* Header */}
      <div className="pub-cust-header">
        <button className="pub-cust-back" onClick={() => navigate(-1)}><FiArrowLeft size={18} /></button>
        <div className="pub-cust-header__icon" style={{ background: '#1e293b' }}><FiUser size={20} /></div>
        <h1 className="pub-cust-header__title">Customers</h1>
        <button className="pub-cust-add-btn" onClick={() => { setAddForm({ ...EMPTY_CUSTOMER }); setAddErrors({}); setAddOpen(true); }}>
          <FiPlus size={16} /> New Customer
        </button>
      </div>

      <div className="pub-cust-body">
        {/* Search */}
        <div className="pub-cust-search-wrap">
          <FiSearch className="pub-cust-search-icon" size={16} />
          <input
            className="pub-cust-search"
            placeholder="Search by name, mobile, city..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="pub-cust-search-clear" onClick={() => setQuery('')}><FiX size={14} /></button>
          )}
        </div>

        {/* Results */}
        <div className="pub-cust-list">
          {loading && (
            <div className="pub-cust-state">
              <div className="pub-cust-spinner" /> Searching...
            </div>
          )}
          {!loading && searched && results.length === 0 && (
            <div className="pub-cust-state">
              <p>No customers found for "<strong>{query}</strong>"</p>
              <button className="pub-cust-add-inline" onClick={() => { setAddForm({ ...EMPTY_CUSTOMER, firstName: query }); setAddErrors({}); setAddOpen(true); }}>
                <FiPlus size={14} /> Add "{query}" as new customer
              </button>
            </div>
          )}
          {!loading && results.map(c => (
            <CustomerCard key={c.id} customer={c} onClick={handleSelect} />
          ))}
          {!loading && !searched && (
            <div className="pub-cust-state pub-cust-state--hint">
              <FiSearch size={32} style={{ opacity: 0.3 }} />
              <p>Type a name or mobile number to search</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="New Customer"
        size="medium" loading={saving} closeOnOverlayClick={!saving}
        actions={[
          { label: 'Cancel', onClick: () => setAddOpen(false), variant: 'secondary', disabled: saving },
          { label: 'Create Customer', onClick: handleSaveAdd, variant: 'primary', disabled: saving },
        ]}>
        <PubCustomerForm form={addForm} setForm={setAddForm} errors={addErrors} setErrors={setAddErrors} />
      </Modal>
    </div>
  );
}

// ── Shared form components ────────────────────────────────────────
function PubCustomerForm({ form, setForm, errors, setErrors }) {
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(e => ({ ...e, [f]: '' })); };
  return (
    <div className="modal-form">
      <div className="pub-cust-form-row">
        <div className="form-group">
          <TextBox label="First Name" required leftIcon={<FiUser />}
            value={form.firstName} onChange={e => set('firstName', e.target.value)}
            placeholder="First name" error={errors.firstName} />
        </div>
        <div className="form-group">
          <TextBox label="Last Name" leftIcon={<FiUser />}
            value={form.lastName} onChange={e => set('lastName', e.target.value)}
            placeholder="Last name (optional)" />
        </div>
      </div>
      <div className="pub-cust-form-row">
        <div className="form-group">
          <CountrySelect label="ISD Code" required showFlag showISD
            value={form.isdCode} onChange={e => set('isdCode', e.isd)} error={errors.isdCode} />
        </div>
        <div className="form-group">
          <TextBox label="Mobile" required leftIcon={<FiPhone />}
            value={form.mobile} onChange={e => set('mobile', e.target.value)}
            placeholder="Mobile number" error={errors.mobile} />
        </div>
      </div>
      <div className="pub-cust-form-row">
        <div className="form-group">
          <TextBox label="City"
            value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
        </div>
        <div className="form-group">
          <TextBox label="TRN"
            value={form.trn} onChange={e => set('trn', e.target.value)} placeholder="Tax Reg. No." />
        </div>
      </div>
    </div>
  );
}

function AddressForm({ form, setForm, errors, setErrors }) {
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(e => ({ ...e, [f]: '' })); };
  return (
    <div className="modal-form">
      <div className="form-group">
        <TextBox label="Address Line 1" required
          value={form.address1} onChange={e => set('address1', e.target.value)}
          placeholder="Building / Street" error={errors.address1} />
      </div>
      <div className="form-group">
        <TextBox label="Address Line 2"
          value={form.address2} onChange={e => set('address2', e.target.value)} placeholder="Area / Block" />
      </div>
      <div className="pub-cust-form-row">
        <div className="form-group">
          <TextBox label="City" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
        </div>
        <div className="form-group">
          <TextBox label="Country" value={form.country} onChange={e => set('country', e.target.value)} placeholder="Country" />
        </div>
      </div>
      <div className="pub-cust-form-row">
        <div className="form-group">
          <TextBox label="Landmark" value={form.landmark} onChange={e => set('landmark', e.target.value)} placeholder="Near..." />
        </div>
        <div className="form-group">
          <TextBox label="P.O. Box" value={form.poBox} onChange={e => set('poBox', e.target.value)} placeholder="P.O. Box" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address Type</label>
        <div className="pub-cust-type-btns">
          {ADDRESS_TYPES.map(t => (
            <button key={t} type="button"
              className={`pub-cust-type-btn ${form.addressType === t ? 'pub-cust-type-btn--active' : ''}`}
              onClick={() => set('addressType', t)}>{t}</button>
          ))}
        </div>
      </div>
      {form.addressType === 'Other' && (
        <div className="form-group">
          <TextBox label="Specify" value={form.addressOtherType} onChange={e => set('addressOtherType', e.target.value)} placeholder="e.g. Villa, Warehouse..." />
        </div>
      )}
    </div>
  );
}

export default Customers;
