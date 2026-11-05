import React, { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiBell, FiCheck, FiRefreshCw, FiShield, FiX } from 'react-icons/fi';
import { useNotification } from '../../components/Notification';
import { searchCustomers } from '../../services/api/customersApi';
import { approveCustomerPolicyRequest, createCustomerAlert, deactivateCustomerAlert, getCustomerPolicyAlerts, getCustomerPolicyRequests, rejectCustomerPolicyRequest, updateCustomerAlert } from '../../services/api/customerPoliciesApi';
import './CustomerPolicies.css';

const unwrap = response => response?.data?.data ?? response?.data ?? response;
const emptyAlert = { customerId: '', message: '', scope: 'CurrentShop', expiresAt: '' };
const dateText = value => value ? new Date(value).toLocaleString() : '—';

export default function CustomerPolicies() {
  const { success, error } = useNotification();
  const [tab, setTab] = useState('requests');
  const [filter, setFilter] = useState('PendingApproval');
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState('');
  const [rejectReasons, setRejectReasons] = useState({});
  const [alertForm, setAlertForm] = useState(emptyAlert);
  const [editingId, setEditingId] = useState(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerMatches, setCustomerMatches] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [requestResponse, alertResponse] = await Promise.all([getCustomerPolicyRequests(), getCustomerPolicyAlerts()]);
      setRequests(unwrap(requestResponse) || []);
      setAlerts(unwrap(alertResponse) || []);
    } catch (err) { error(err?.response?.data?.message || 'Could not load customer rules.'); }
    finally { setLoading(false); }
  }, [error]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    let active = true;
    if (customerQuery.trim().length < 2 || alertForm.customerId) { setCustomerMatches([]); return () => { active = false; }; }
    const timer = setTimeout(async () => {
      try {
        const response = await searchCustomers(customerQuery.trim(), 1, 8);
        if (active) setCustomerMatches(unwrap(response)?.data || unwrap(response)?.items || []);
      } catch { if (active) setCustomerMatches([]); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [customerQuery, alertForm.customerId]);

  const review = async (request, approve) => {
    const key = `${request.requestType}-${request.id}`;
    if (!approve && !rejectReasons[key]?.trim()) { error('Enter a reason for rejecting this request.'); return; }
    setBusyKey(key);
    try {
      if (approve) await approveCustomerPolicyRequest(request.requestType.toLowerCase(), request.id);
      else await rejectCustomerPolicyRequest(request.requestType.toLowerCase(), request.id, rejectReasons[key].trim());
      success(approve ? 'Request approved.' : 'Request rejected.');
      await refresh();
    } catch (err) { error(err?.response?.data?.message || 'Could not review request.'); }
    finally { setBusyKey(''); }
  };

  const saveAlert = async event => {
    event.preventDefault();
    setBusyKey('alert');
    const payload = { ...alertForm, customerId: Number(alertForm.customerId), expiresAt: alertForm.expiresAt ? new Date(alertForm.expiresAt).toISOString() : null };
    try {
      if (editingId) await updateCustomerAlert(editingId, payload); else await createCustomerAlert(payload);
      success(editingId ? 'Alert updated.' : 'Alert created.');
      setAlertForm(emptyAlert); setEditingId(null); setCustomerQuery(''); await refresh();
    } catch (err) { error(err?.response?.data?.message || 'Could not save the alert.'); }
    finally { setBusyKey(''); }
  };
  const editAlert = alert => {
    setEditingId(alert.id); setCustomerQuery(`${alert.customerName} · #${alert.customerId}`);
    setAlertForm({ customerId: String(alert.customerId), message: alert.message, scope: alert.scope === 'All Shops' ? 'AllShops' : 'CurrentShop', expiresAt: alert.expiresAt ? new Date(alert.expiresAt).toISOString().slice(0, 16) : '' });
  };
  const removeAlert = async alert => {
    setBusyKey(`alert-${alert.id}`);
    try { await deactivateCustomerAlert(alert.id); success('Alert deactivated.'); await refresh(); }
    catch (err) { error(err?.response?.data?.message || 'Could not deactivate alert.'); }
    finally { setBusyKey(''); }
  };

  const visibleRequests = requests.filter(item => filter === 'All' || item.status === filter);
  return <main className="customer-policies-page">
    <header className="cp-page-header"><div><p className="cp-eyebrow">CUSTOMER MANAGEMENT</p><h1>Customer blocks and alerts</h1><p>Review block and unblock requests, and manage shop scoped customer alerts.</p></div>
      <button className="cp-refresh" onClick={refresh} disabled={loading}><FiRefreshCw className={loading ? 'cp-spin' : ''} /> Refresh</button></header>
    <div className="cp-tabs"><button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}><FiShield /> Block / unblock requests</button><button className={tab === 'alerts' ? 'active' : ''} onClick={() => setTab('alerts')}><FiBell /> Customer alerts</button></div>
    {tab === 'requests' ? <section className="cp-section">
      <div className="cp-toolbar"><div><h2><FiAlertTriangle /> Approval queue</h2><p>{visibleRequests.length} request{visibleRequests.length === 1 ? '' : 's'}</p></div><select value={filter} onChange={e => setFilter(e.target.value)}><option value="PendingApproval">Awaiting approval</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="All">All requests</option></select></div>
      {!visibleRequests.length && <div className="cp-empty">No requests in this view.</div>}
      <div className="cp-request-list">{visibleRequests.map(request => {
        const key = `${request.requestType}-${request.id}`;
        return <article className="cp-request-card" key={key}>
          <div className="cp-request-head"><div><span className={`cp-type cp-type-${request.requestType.toLowerCase()}`}>{request.requestType} request</span><span className={`cp-status cp-status-${request.status.toLowerCase()}`}>{request.status === 'PendingApproval' ? 'Awaiting approval' : request.status}</span></div><time>{dateText(request.createdAt)}</time></div>
          <h3>{request.customerName}</h3><p className="cp-mobile">{request.mobile}</p><p>{request.reason}</p>
          <div className="cp-request-meta"><span><b>Scope</b>{request.scope}{request.shopName ? ` · ${request.shopName}` : ''}</span><span><b>Requested by</b>{request.requestedBy}</span></div>
          {request.reviewReason && <p className="cp-review-reason">Admin note: {request.reviewReason}</p>}
          {request.status === 'PendingApproval' && <div className="cp-review-actions"><button className="cp-approve" disabled={busyKey === key} onClick={() => review(request, true)}><FiCheck /> Approve</button><div><input aria-label="Rejection reason" placeholder="Reason required to reject" value={rejectReasons[key] || ''} onChange={e => setRejectReasons(previous => ({ ...previous, [key]: e.target.value }))} /><button className="cp-reject" disabled={busyKey === key || !rejectReasons[key]?.trim()} onClick={() => review(request, false)}><FiX /> Reject</button></div></div>}
        </article>;
      })}</div>
    </section> : <section className="cp-section cp-alerts-layout">
      <form className="cp-alert-form" onSubmit={saveAlert}><h2>{editingId ? 'Update alert' : 'Create customer alert'}</h2><label>Customer<input required autoComplete="off" placeholder="Search by name or mobile" value={customerQuery} onChange={e => { setCustomerQuery(e.target.value); setAlertForm({ ...alertForm, customerId: '' }); }} /></label>{customerMatches.length > 0 && <div className="cp-customer-matches">{customerMatches.map(customer => <button type="button" key={customer.id} onClick={() => { setAlertForm({ ...alertForm, customerId: String(customer.id) }); setCustomerQuery(`${customer.firstName} ${customer.lastName || ''} · ${customer.fullMobileNumber || `${customer.isdCode}${customer.mobile}`}`); setCustomerMatches([]); }}>{customer.firstName} {customer.lastName || ''}<small>{customer.fullMobileNumber || `${customer.isdCode}${customer.mobile}`}</small></button>)}</div>}{alertForm.customerId && <small className="cp-selected-customer">Selected customer #{alertForm.customerId}</small>}<label>Message<textarea required maxLength={2000} value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} /></label><label>Show in<select value={alertForm.scope} onChange={e => setAlertForm({ ...alertForm, scope: e.target.value })}><option value="CurrentShop">Selected shop</option><option value="AllShops">All shops</option></select></label><label>Expiry (optional)<input type="datetime-local" value={alertForm.expiresAt} onChange={e => setAlertForm({ ...alertForm, expiresAt: e.target.value })} /></label><div className="cp-form-actions"><button disabled={busyKey === 'alert' || !alertForm.customerId} type="submit">{editingId ? 'Update alert' : 'Save alert'}</button>{editingId && <button type="button" className="cp-secondary" onClick={() => { setAlertForm(emptyAlert); setEditingId(null); setCustomerQuery(''); }}>Cancel</button>}</div></form>
      <div className="cp-alert-list"><h2>Customer alerts</h2>{alerts.map(alert => <article key={alert.id} className={`cp-alert-card ${!alert.isActive ? 'inactive' : ''}`}><div className="cp-alert-title"><strong>{alert.customerName}</strong><span className={alert.isActive ? 'cp-status cp-status-approved' : 'cp-status cp-status-rejected'}>{alert.isActive ? 'Active' : 'Inactive'}</span></div><p className="cp-mobile">Customer #{alert.customerId} · {alert.scope}{alert.shopName ? ` · ${alert.shopName}` : ''}</p><p>{alert.message}</p><small>Added by {alert.createdBy} · {dateText(alert.createdAt)} · {alert.expiresAt ? `Expires ${dateText(alert.expiresAt)}` : 'No expiry'}</small><div className="cp-alert-actions"><button onClick={() => editAlert(alert)}>Edit</button>{alert.isActive && <button className="cp-danger" disabled={busyKey === `alert-${alert.id}`} onClick={() => removeAlert(alert)}>Deactivate</button>}</div></article>)}{alerts.length === 0 && <div className="cp-empty">No customer alerts found.</div>}</div>
    </section>}
  </main>;
}
