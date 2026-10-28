import React, { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiRefreshCw, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { createTile, deleteTile, getTiles, updateTile } from '../../../services/api/tileApiService';
import './TilesMasterData.css';
import { commonLogic } from '../../../utils/commonLogic';

const emptyTile = { code: '', label: '', icon: 'FiGrid', path: '/', color: '#315be8', size: 'Large', subtitle: '', displayOrder: 1 };
const unwrap = response => response?.data?.data ?? response?.data ?? response;
const getList = response => { const value = unwrap(response); return Array.isArray(value) ? value : value?.data ?? []; };

export default function TilesMasterData() {
  const [tiles, setTiles] = useState([]);
  const [form, setForm] = useState(emptyTile);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTiles = useCallback(async () => {
    setLoading(true); setError('');
    try { setTiles(getList(await getTiles(1, commonLogic.maxPageSize))); }
    catch (e) { setError(e?.message || 'Unable to load tiles.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadTiles(); }, [loadTiles]);

  const reset = () => { setForm(emptyTile); setEditingId(null); };
  const edit = tile => {
    setEditingId(tile.id);
    setForm({ code: tile.code ?? '', label: tile.label ?? '', icon: tile.icon ?? '', path: tile.path ?? '', color: tile.color ?? '#315be8', size: tile.size ?? 'Large', subtitle: tile.subtitle ?? '', displayOrder: tile.displayOrder ?? 1 });
    setError(''); setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const payload = { ...form, id: editingId ?? 0, displayOrder: Number(form.displayOrder) || 0 };
    try {
      if (editingId) await updateTile(editingId, payload); else await createTile(payload);
      reset(); setNotice(editingId ? 'Tile updated.' : 'Tile added.'); await loadTiles();
    } catch (e) { setError(e?.message || 'Unable to save tile.'); }
    finally { setSaving(false); }
  };
  const remove = async tile => {
    if (!window.confirm(`Delete the “${tile.label}” tile?`)) return;
    setError(''); setNotice('');
    try { await deleteTile(tile.id); if (editingId === tile.id) reset(); setNotice('Tile deleted.'); await loadTiles(); }
    catch (e) { setError(e?.message || 'Unable to delete tile.'); }
  };

  return <main className="tiles-master-page">
    <header className="tiles-master-header"><div><h1>Tiles</h1><p>Add and update the tiles shown in the app. Use a valid React icon name, such as FiGrid.</p></div><button type="button" onClick={loadTiles} disabled={loading} title="Refresh"><FiRefreshCw /> Refresh</button></header>
    {error && <div className="tiles-master-message is-error" role="alert">{error}</div>}{notice && <div className="tiles-master-message is-success" role="status">{notice}</div>}
    <section className="tiles-master-card"><h2>{editingId ? 'Update tile' : 'Add tile'}</h2>
      <form className="tiles-master-form" onSubmit={save}>
        <label>Code<input required maxLength="50" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="ORDERS_SEARCH" /></label>
        <label>Label<input required maxLength="100" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Search Orders" /></label>
        <label>Icon name<input required value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="FiSearch" /></label>
        <label>Route path<input required value={form.path} onChange={e => setForm({ ...form, path: e.target.value })} placeholder="/orders/search" /></label>
        <label>Color<input required value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#315be8" /></label>
        <label>Size<select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}><option>Large</option><option>Medium</option><option>Small</option></select></label>
        <label>Subtitle<input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} /></label>
        <label>Display order<input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} /></label>
        <div className="tiles-master-form__actions"><button className="is-primary" type="submit" disabled={saving}><FiSave /> {saving ? 'Saving…' : editingId ? 'Update tile' : 'Add tile'}</button>{editingId && <button type="button" onClick={reset}><FiX /> Cancel</button>}</div>
      </form>
    </section>
    <section className="tiles-master-card"><h2>Existing tiles <span>{tiles.length}</span></h2>
      {loading ? <p className="tiles-master-empty">Loading tiles…</p> : tiles.length === 0 ? <p className="tiles-master-empty">No tiles have been added.</p> : <div className="tiles-master-table-wrap"><table className="tiles-master-table"><thead><tr><th>Order</th><th>Tile</th><th>Code</th><th>Route</th><th>Icon</th><th>Actions</th></tr></thead><tbody>{tiles.map(tile => <tr key={tile.id}><td>{tile.displayOrder}</td><td><strong>{tile.label}</strong><small>{tile.subtitle}</small></td><td>{tile.code}</td><td>{tile.path}</td><td>{tile.icon}</td><td><div className="tiles-master-row-actions"><button type="button" onClick={() => edit(tile)} aria-label={`Edit ${tile.label}`}><FiEdit2 /> Edit</button><button type="button" className="is-danger" onClick={() => remove(tile)} aria-label={`Delete ${tile.label}`}><FiTrash2 /> Delete</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
