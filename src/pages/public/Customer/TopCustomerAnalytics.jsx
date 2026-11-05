import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAward, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiRefreshCw, FiSearch, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { getCustomerAnalytics, recalculateCustomerAnalytics } from '../../../services/api/customerAnalyticsApi';
import { getShops } from '../../../services/api/shopApi';
import './TopCustomerAnalytics.css';

const tabs = ['Customer Analytics & Classification', 'Customer Order Frequency', 'Customer Payment Delay Analytics'];
const money = value => `AED ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = value => value ? new Date(value).toLocaleDateString() : '—';

export default function TopCustomerAnalytics() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin || user?.IsAdmin);
  const [tab, setTab] = useState(0); const [rows, setRows] = useState([]); const [shops, setShops] = useState([]); const [shopId, setShopId] = useState('');
  const [global, setGlobal] = useState(false); const [search, setSearch] = useState(''); const [klass, setKlass] = useState('All'); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [page, setPage] = useState(1); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selected, setSelected] = useState(null); const [busy, setBusy] = useState(false);
  const pageSize = 25;
  useEffect(() => { if (isAdmin) getShops(1, 100).then(r => setShops(r?.data?.items || r?.data || [])).catch(() => {}); }, [isAdmin]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await getCustomerAnalytics({ shopId: global ? '' : shopId, global, search, customerClass: klass, from, to, page, pageSize, sort: tab === 1 ? 'orders' : tab === 2 ? 'amount' : 'score', descending: true });
      const payload = response?.data?.data || response?.data || {};
      setRows(payload.items || []); setTotal(payload.totalCount || 0);
    } catch (e) { setError(e?.response?.data?.message || e.message || 'Could not load customer analytics.'); setRows([]); }
    finally { setLoading(false); }
  }, [global, shopId, search, klass, from, to, page, tab]);
  useEffect(() => { load(); }, [load]);
  const totals = useMemo(() => rows.reduce((a, x) => ({ customers: a.customers + 1, orders: a.orders + Number(x.totalOrders || 0), sales: a.sales + Number(x.totalOrderAmount || 0), overdue: a.overdue + Number(x.totalOverdueAmount || 0) }), { customers: 0, orders: 0, sales: 0, overdue: 0 }), [rows]);
  const manualRun = async () => { setBusy(true); try { await recalculateCustomerAnalytics(); await load(); } catch (e) { setError(e?.message || 'Could not start recalculation.'); } finally { setBusy(false); } };
  const val = (r, key) => {
    if (tab === 1) return ({ days: r.averageDaysBetweenOrders == null ? 'New customer' : `${r.averageDaysBetweenOrders.toFixed(1)} days`, perMonth: Number(r.averageOrdersPerMonth || 0).toFixed(1), inactive: `${r.daysSinceLastOrder} days` })[key];
    if (tab === 2) return ({ delay: `${Number(r.averagePaymentDelayDays || 0).toFixed(1)} days`, maxDelay: `${r.maximumPaymentDelayDays || 0} days`, performance: `${Number(r.paymentPerformanceScore || 0).toFixed(0)} / 100`, ontime: r.paymentsOnTime || 0, delayed: r.paymentsDelayed || 0, paidDate: day(r.lastPaymentDate) })[key];
    return ({ average: money(r.averageOrderValue), score: `${r.analyticsScore || 0}`, delivery: day(r.lastDeliveryDate) })[key];
  };
  return <main className="tca-page">
    <header className="tca-head"><div><span className="tca-eyebrow">CUSTOMER INTELLIGENCE</span><h1>Top customer analytics</h1><p>Understand customer value, loyalty, and payment behavior from recorded orders.</p></div>{isAdmin && <button className="tca-refresh" disabled={busy} onClick={manualRun}><FiRefreshCw /> {busy ? 'Starting…' : 'Recalculate'}</button>}</header>
    <nav className="tca-tabs">{tabs.map((name, i) => <button key={name} className={tab === i ? 'active' : ''} onClick={() => { setTab(i); setPage(1); }}>{i === 0 ? <FiAward /> : i === 1 ? <FiClock /> : <FiCalendar />}{name}</button>)}</nav>
    <section className="tca-summary"><article><small><FiUsers /> Customers shown</small><strong>{total}</strong></article><article><small>Total orders on page</small><strong>{totals.orders}</strong></article><article><small>Order amount on page</small><strong>{money(totals.sales)}</strong></article><article><small>Overdue on page</small><strong className="tca-overdue">{money(totals.overdue)}</strong></article></section>
    <section className="tca-panel">
      <div className="tca-filters"><label className="tca-search"><FiSearch /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customer or mobile" /></label>
        {isAdmin && <><select value={global ? 'global' : shopId} onChange={e => { setGlobal(e.target.value === 'global'); setShopId(e.target.value === 'global' ? '' : e.target.value); setPage(1); }}><option value="">Current shop</option><option value="global">All shops</option>{shops.map(s => <option key={s.id} value={s.id}>{s.name || s.shopName || `Shop ${s.id}`}</option>)}</select></>}
        <select value={klass} onChange={e => { setKlass(e.target.value); setPage(1); }}><option>All</option><option>Regular</option><option>VIP</option><option>VVIP</option></select>
        <label>From <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} /></label><label>To <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} /></label>
      </div>
      {tab === 1 && <div className="tca-note">Frequency signals: frequent (4+ orders/month), regular (at least 1/month), inactive (90+ days), newly acquired (first order in the last 30 days). Data uses non-cancelled orders.</div>}
      {tab === 2 && <div className="tca-note">Payment due date is each order’s delivery date. Advance payments are credited to the order; unpaid balances past delivery are shown as overdue.</div>}
      {error && <div className="tca-error">{error}</div>}
      {loading ? <div className="tca-state">Loading customer analytics…</div> : rows.length === 0 ? <div className="tca-state">No customer order data matches these filters.</div> : <div className="tca-table-wrap"><table className="tca-table"><thead><tr>{(tab === 0 ? ['Customer','Class','Orders','Order amount','Avg. order','Paid','Outstanding','Score','Last order','Last delivery'] : tab === 1 ? ['Customer','Class','Orders','This month','This quarter','This year','Days between','Orders / month','First order','Last order','Days inactive'] : ['Customer','Class','Orders','Order amount','Paid','Outstanding','Overdue','Avg. delay','Max delay','On time','Delayed','Score','Last payment']).map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.customerId} onClick={() => setSelected(r)}><td><strong>{r.customerName}</strong><small>{r.mobile}</small></td><td><span className={`tca-badge ${String(r.customerClass).toLowerCase()}`}>{r.customerClass}</span></td>{tab === 0 ? <><td>{r.totalOrders}</td><td>{money(r.totalOrderAmount)}</td><td>{val(r,'average')}</td><td>{money(r.totalPaidAmount)}</td><td>{money(r.outstandingAmount)}</td><td>{val(r,'score')}</td><td>{day(r.lastOrderDate)}</td><td>{val(r,'delivery')}</td></> : tab === 1 ? <><td>{r.totalOrders}</td><td>—</td><td>—</td><td>—</td><td>{val(r,'days')}</td><td>{val(r,'perMonth')}</td><td>{day(r.firstOrderDate)}</td><td>{day(r.lastOrderDate)}</td><td>{val(r,'inactive')}</td></> : <><td>{r.totalOrders}</td><td>{money(r.totalOrderAmount)}</td><td>{money(r.totalPaidAmount)}</td><td>{money(r.outstandingAmount)}</td><td className="tca-overdue">{money(r.totalOverdueAmount)}</td><td>{val(r,'delay')}</td><td>{val(r,'maxDelay')}</td><td>{val(r,'ontime')}</td><td>{val(r,'delayed')}</td><td>{val(r,'performance')}</td><td>{val(r,'paidDate')}</td></>}</tr>)}</tbody></table></div>}
      <footer className="tca-pagination"><span>{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}` : '0 customers'}</span><button disabled={page <= 1} onClick={() => setPage(page - 1)}><FiChevronLeft /> Previous</button><button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next <FiChevronRight /></button></footer>
    </section>
    {selected && <div className="tca-overlay" onClick={() => setSelected(null)}><aside className="tca-drawer" onClick={e => e.stopPropagation()}><button className="tca-close" onClick={() => setSelected(null)}>×</button><span className="tca-eyebrow">CUSTOMER DETAILS</span><h2>{selected.customerName}</h2><p>{selected.mobile}</p><span className={`tca-badge ${String(selected.customerClass).toLowerCase()}`}>{selected.customerClass}</span><dl>{[['Orders',selected.totalOrders],['Total order amount',money(selected.totalOrderAmount)],['Average order value',money(selected.averageOrderValue)],['Paid',money(selected.totalPaidAmount)],['Outstanding',money(selected.outstandingAmount)],['Overdue',money(selected.totalOverdueAmount)],['Analytics score',selected.analyticsScore],['First order',day(selected.firstOrderDate)],['Last order',day(selected.lastOrderDate)],['Last delivery',day(selected.lastDeliveryDate)],['Last payment',day(selected.lastPaymentDate)]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></aside></div>}
  </main>;
}
