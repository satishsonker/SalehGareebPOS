import React, { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiRefreshCw, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { addWorkTypeDescription, deleteWorkTypeDescription, getWorkTypeDescriptionsFresh, getWorkTypes, updateWorkTypeDescription } from '../../../services/api/workTypeApi';
import './WorkTypeDescriptions.css';

const empty = { workTypeId: '', name: '', isDefault: false };
const unwrap = response => response?.data?.data ?? response?.data ?? response;
const list = response => { const value = unwrap(response); return Array.isArray(value) ? value : value?.data ?? []; };

export default function WorkTypeDescriptions() {
  const [workTypes, setWorkTypes] = useState([]); const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty); const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const [types, descriptions] = await Promise.all([getWorkTypes(), getWorkTypeDescriptionsFresh()]); setWorkTypes(list(types)); setRows(list(descriptions)); }
    catch (e) { setError(e?.message || 'Unable to load work type descriptions.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const reset = () => { setForm(empty); setEditingId(null); };
  const edit = row => { setEditingId(row.id); setForm({ workTypeId: String(row.workTypeId), name: row.name || '', isDefault: Boolean(row.isDefault) }); setError(''); setNotice(''); };
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const payload = { id: editingId ?? 0, workTypeId: Number(form.workTypeId), name: form.name.trim(), isDefault: form.isDefault };
    try { if (editingId) await updateWorkTypeDescription(editingId, payload); else await addWorkTypeDescription(payload); reset(); setNotice(editingId ? 'Description updated.' : 'Description added.'); await load(); }
    catch (e) { setError(e?.message || 'Unable to save description.'); }
    finally { setSaving(false); }
  };
  const remove = async row => {
    if (!window.confirm(`Delete “${row.name}” description?`)) return;
    setError(''); setNotice('');
    try { await deleteWorkTypeDescription(row.id); if (editingId === row.id) reset(); setNotice('Description deleted.'); await load(); }
    catch (e) { setError(e?.message || 'Unable to delete description.'); }
  };
  const typeName = id => workTypes.find(type => type.id === id)?.name || 'Unknown work type';
  return <main className="work-desc-page">
    <header className="work-desc-header"><div><h1>Work type descriptions</h1><p>Manage selectable descriptions and default selections for each work type.</p></div><button type="button" onClick={load} disabled={loading}><FiRefreshCw /> Refresh</button></header>
    {error && <div role="alert" className="work-desc-message is-error">{error}</div>}{notice && <div role="status" className="work-desc-message is-success">{notice}</div>}
    <section className="work-desc-card"><h2>{editingId ? 'Update description' : 'Add description'}</h2><form className="work-desc-form" onSubmit={save}>
      <label>Work type<select required value={form.workTypeId} onChange={e => setForm({ ...form, workTypeId: e.target.value })}><option value="">Select work type</option>{workTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
      <label>Description<input required maxLength="200" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter description" /></label>
      <label className="work-desc-default"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} /> Select by default when adding this work type</label>
      <div className="work-desc-actions"><button type="submit" className="is-primary" disabled={saving || !workTypes.length}><FiSave /> {saving ? 'Saving…' : editingId ? 'Update' : 'Add description'}</button>{editingId && <button type="button" onClick={reset}><FiX /> Cancel</button>}</div>
    </form></section>
    <section className="work-desc-card"><h2>Descriptions <span>{rows.length}</span></h2>{loading ? <p className="work-desc-empty">Loading descriptions…</p> : !rows.length ? <p className="work-desc-empty">No descriptions configured.</p> : <div className="work-desc-table-wrap"><table className="work-desc-table"><thead><tr><th>Work type</th><th>Description</th><th>Default</th><th>Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.workType || typeName(row.workTypeId)}</td><td>{row.name}</td><td>{row.isDefault ? 'Yes' : 'No'}</td><td><div className="work-desc-actions"><button type="button" onClick={() => edit(row)}><FiEdit2 /> Edit</button><button type="button" className="is-danger" onClick={() => remove(row)}><FiTrash2 /> Delete</button></div></td></tr>)}</tbody></table></div>}</section>
  </main>;
}
