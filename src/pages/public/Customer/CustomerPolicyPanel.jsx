import React, { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiLock, FiUnlock, FiBell, FiRefreshCw } from 'react-icons/fi';
import { getCustomerPolicy, requestCustomerBlock, requestCustomerUnblock, createCustomerAlert } from '../../../services/api/customerPoliciesApi';

const dataOf = response => response?.data?.data ?? response?.data ?? response;
const formatWhen = value => value ? new Date(value).toLocaleString() : '—';

export default function CustomerPolicyPanel({ customer }) {
  const [policy, setPolicy] = useState(null);
  const [scope, setScope] = useState('CurrentShop');
  const [reason, setReason] = useState('');
  const [alertText, setAlertText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const refresh = useCallback(async () => {
    if (!customer?.id) return;
    setLoading(true);
    try { setPolicy(dataOf(await getCustomerPolicy(customer.id))); }
    catch (error) { setMessage(error?.response?.data?.message || 'Could not load customer policy.'); }
    finally { setLoading(false); }
  }, [customer?.id]);
  useEffect(() => { setPolicy(null); setMessage(''); refresh(); }, [refresh]);

  const submit = async action => {
    setSaving(true); setMessage('');
    try {
      if (action === 'block') await requestCustomerBlock({ customerId: customer.id, scope, reason });
      if (action === 'unblock') await requestCustomerUnblock({ customerBlockId: policy?.block?.id, reason });
      if (action === 'alert') await createCustomerAlert({ customerId: customer.id, scope, message: alertText });
      setReason(''); setAlertText('');
      setMessage(action === 'alert' ? 'Customer alert saved.' : 'Request sent to an administrator for approval.');
      await refresh();
    } catch (error) { setMessage(error?.response?.data?.message || error?.response?.data?.title || 'Could not save this change.'); }
    finally { setSaving(false); }
  };

  return <section className="pub-cust-section customer-policy-panel">
    <div className="pub-cust-section__header"><h3 className="pub-cust-section__title"><FiAlertTriangle size={14} /> Customer rules</h3>
      <button type="button" className="pub-cust-mini-btn" onClick={refresh} disabled={loading}><FiRefreshCw size={13} /> Refresh</button></div>
    {loading && <p className="pub-cust-empty">Loading customer rules…</p>}
    {policy?.block && <div className="customer-policy-block"><b><FiLock /> Order creation blocked · {policy.block.scope}</b>
      <div>{policy.block.reason}</div><small>Approved by {policy.block.approvedBy} · {formatWhen(policy.block.blockedAt)}</small>
      {policy.block.unblockRequestStatus === 'PendingApproval' && <p>Unblock request is awaiting admin approval.</p>}
    </div>}
    {!policy?.block && policy && <div className="customer-policy-form">
      <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} placeholder="Reason for requesting a customer block" />
      <div className="customer-policy-controls"><select value={scope} onChange={e => setScope(e.target.value)}><option value="CurrentShop">This shop</option><option value="AllShops">All shops</option></select>
        <button type="button" className="pub-cust-mini-btn" disabled={saving || !reason.trim()} onClick={() => submit('block')}><FiLock /> Request block</button></div>
    </div>}
    {policy?.block && policy.block.id > 0 && policy.block.unblockRequestStatus !== 'PendingApproval' && <div className="customer-policy-form">
      <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} placeholder="Reason for requesting unblock" />
      <button type="button" className="pub-cust-mini-btn" disabled={saving || !reason.trim()} onClick={() => submit('unblock')}><FiUnlock /> Request unblock</button>
    </div>}
    {policy?.block?.id === 0 && <p className="pub-cust-empty">This customer has an older global block. An administrator must clear this legacy block before order creation.</p>}
    <div className="customer-policy-form"><label><FiBell /> Informational alert</label>
      <textarea value={alertText} onChange={e => setAlertText(e.target.value)} maxLength={2000} placeholder="Message shown when this customer is selected for an order" />
      <div className="customer-policy-controls"><select value={scope} onChange={e => setScope(e.target.value)}><option value="CurrentShop">This shop</option><option value="AllShops">All shops</option></select>
        <button type="button" className="pub-cust-mini-btn" disabled={saving || !alertText.trim()} onClick={() => submit('alert')}>Save alert</button></div>
    </div>
    {policy?.alerts?.map(alert => <div key={alert.id} className="customer-policy-alert"><b>{alert.scope} alert</b><p>{alert.message}</p><small>By {alert.createdBy} · {alert.expiresAt ? `Expires ${formatWhen(alert.expiresAt)}` : 'No expiry'}</small></div>)}
    {policy?.requests?.slice(0, 8).map(request => <div className="customer-policy-request" key={`${request.requestType}-${request.id}`}><b>{request.requestType} · {request.status}</b><span>{request.scope} · {formatWhen(request.createdAt)}</span><p>{request.reason}</p>{request.reviewReason && <small>Admin note: {request.reviewReason}</small>}</div>)}
    {policy?.history?.slice(0, 8).map(item => <small className="customer-policy-history" key={item.id}>{item.action} · {item.scope} · {item.actor} · {formatWhen(item.occurredAt)} — {item.reason}</small>)}
    {message && <p role="status" className="pub-cust-empty">{message}</p>}
  </section>;
}
