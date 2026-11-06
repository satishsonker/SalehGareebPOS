import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiActivity, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { getAllActivities } from '../../services/api/notificationApi';
import './ApplicationActivityLog.css';

const format = value => value ? new Date(value).toLocaleString() : '—';
export default function ApplicationActivityLog() {
  const [items, setItems] = useState([]); const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const pageSize = 50;
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await getAllActivities(page, pageSize);
      if (!response?.success) throw new Error(response?.message || 'Could not load activity records.');
      setItems(response.data?.data || []); setTotal(response.data?.totalRecords || 0);
    } catch (e) { setError(e.message || 'Could not load activity records.'); setItems([]); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? items.filter(x => [x.userName, x.activityType, x.description, x.entityName, x.ipAddress].some(v => String(v || '').toLowerCase().includes(term))) : items;
  }, [items, search]);
  return <section className="activity-log-page">
    <header className="activity-log-header"><div><span>ADMINISTRATION</span><h2><FiActivity /> Application Activity Log</h2><p>Review recorded user and application changes.</p></div><button onClick={load} disabled={loading}><FiRefreshCw className={loading ? 'activity-spin' : ''} /> Refresh</button></header>
    <div className="activity-log-toolbar"><label><FiSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, action, record, or IP" /></label><span>{total.toLocaleString()} records</span></div>
    {error && <div className="activity-log-error">{error}</div>}
    {loading ? <div className="activity-log-state">Loading activity…</div> : filtered.length === 0 ? <div className="activity-log-state">No activity records found.</div> : <div className="activity-log-table-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Activity</th><th>Description</th><th>Record</th><th>IP address</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td>{format(item.timestamp)}</td><td>{item.userName || `User ${item.userId}`}</td><td><span>{item.activityType || 'Activity'}</span></td><td>{item.description}</td><td>{item.entityName ? `${item.entityName}${item.entityId ? ` #${item.entityId}` : ''}` : '—'}</td><td>{item.ipAddress || '—'}</td></tr>)}</tbody></table></div>}
    <footer className="activity-log-pagination"><span>Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span><button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><button disabled={page * pageSize >= total || loading} onClick={() => setPage(p => p + 1)}>Next</button></footer>
  </section>;
}
