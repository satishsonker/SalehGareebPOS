import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckSquare, FiLoader, FiRefreshCw, FiSave, FiSearch, FiShield } from 'react-icons/fi';
import { getUsers } from '../../../services/api/usersApi';
import { getShops } from '../../../services/api/shopApi';
import { getTiles, getUserShopTilePermissions, updateUserTilePermissions } from '../../../services/api/tileApiService';
import './UserTilePermissions.css';
import { commonLogic } from '../../../utils/commonLogic';

const unwrap = response => response?.data?.data ?? response?.data ?? response;
const listFrom = response => {
  const value = unwrap(response);
  return Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
};

export default function UserTilePermissions() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [userId, setUserId] = useState('');
  const [shopId, setShopId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  const loadDirectory = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResult, shopsResult, tilesResult] = await Promise.all([getUsers(1, commonLogic.maxPageSize), getShops(1, commonLogic.maxPageSize), getTiles(1, commonLogic.maxPageSize)]);
      setUsers(listFrom(usersResult).filter(user => !user.isBlocked));
      setShops(listFrom(shopsResult));
      setTiles(listFrom(tilesResult));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load users, shops, and tiles.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDirectory(); }, []);

  useEffect(() => {
    let active = true;
    if (!userId || !shopId) { setPermissions({}); return () => { active = false; }; }
    setLoading(true);
    setError('');
    setNotice('');
    getUserShopTilePermissions(userId, shopId).then(response => {
      if (!active) return;
      const rows = listFrom(response);
      setTiles(current => rows.length ? rows : current);
      setPermissions(Object.fromEntries(rows.map(tile => [tile.tileId, Boolean(tile.hasAccess)])));
    }).catch(requestError => {
      if (active) { setPermissions({}); setError(requestError?.message || 'Unable to load tile permissions.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, shopId]);

  const filteredTiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tiles.filter(tile => !query || `${tile.label} ${tile.code} ${tile.path}`.toLowerCase().includes(query));
  }, [tiles, search]);
  const grantedCount = tiles.filter(tile => permissions[tile.id ?? tile.tileId]).length;

  const save = async () => {
    if (!userId || !shopId) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await updateUserTilePermissions({
        userId: Number(userId),
        shopId: Number(shopId),
        permissions: tiles.map(tile => ({ tileId: Number(tile.id ?? tile.tileId), hasAccess: Boolean(permissions[tile.id ?? tile.tileId]) }))
      });
      setNotice('Tile access saved for this user and shop.');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save tile access.');
    } finally { setSaving(false); }
  };

  const setAll = value => setPermissions(Object.fromEntries(tiles.map(tile => [tile.id ?? tile.tileId, value])));
  const selectedUser = users.find(user => String(user.id) === String(userId));
  const selectedShop = shops.find(shop => String(shop.id) === String(shopId));

  return <main className="tile-permissions-page">
    <header className="tile-permissions-header">
      <span className="tile-permissions-header__icon"><FiShield /></span>
      <div><h1>Shop tile access</h1><p>Choose which home tiles a user can open in each shop.</p></div>
      <button type="button" onClick={loadDirectory} disabled={loading} title="Refresh"><FiRefreshCw className={loading ? 'tile-permissions-spin' : ''} /></button>
    </header>

    <section className="tile-permissions-card tile-permissions-selectors">
      <label>User<select value={userId} onChange={event => setUserId(event.target.value)}><option value="">Select a user</option>{users.map(user => <option key={user.id} value={user.id}>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username}</option>)}</select></label>
      <label>Shop<select value={shopId} onChange={event => setShopId(event.target.value)}><option value="">Select a shop</option>{shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name} ({shop.code})</option>)}</select></label>
      <div className="tile-permissions-count"><FiCheckSquare /><strong>{grantedCount}</strong><span>of {tiles.length} tiles enabled</span></div>
    </section>

    {error && <div className="tile-permissions-message is-error" role="alert">{error}</div>}
    {notice && <div className="tile-permissions-message is-success" role="status">{notice}</div>}

    <section className="tile-permissions-card">
      <div className="tile-permissions-list-header">
        <div><h2>{selectedUser && selectedShop ? `${selectedUser.firstName || selectedUser.username} · ${selectedShop.name}` : 'Tile permissions'}</h2><p>Tile access is saved independently for every shop.</p></div>
        <div className="tile-permissions-actions"><button type="button" onClick={() => setAll(true)} disabled={!userId || loading}>Select all</button><button type="button" onClick={() => setAll(false)} disabled={!userId || loading}>Clear all</button><button className="is-primary" type="button" onClick={save} disabled={!userId || !shopId || saving || loading}><FiSave /> {saving ? 'Saving…' : 'Save access'}</button></div>
      </div>
      <label className="tile-permissions-search"><FiSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Filter tiles" /></label>
      {loading ? <div className="tile-permissions-empty"><FiLoader className="tile-permissions-spin" /> Loading permissions…</div>
        : !userId || !shopId ? <div className="tile-permissions-empty">Select a user and shop to manage access.</div>
          : filteredTiles.length ? <div className="tile-permissions-grid">{filteredTiles.map(tile => {
            const id = tile.id ?? tile.tileId;
            return <label className={`tile-permission-option${permissions[id] ? ' is-enabled' : ''}`} key={id}>
              <input type="checkbox" checked={Boolean(permissions[id])} onChange={event => setPermissions(current => ({ ...current, [id]: event.target.checked }))} />
              <span className="tile-permission-option__mark"><FiCheckSquare /></span><span><strong>{tile.label}</strong><small>{tile.path || tile.code}</small></span>
            </label>;
          })}</div> : <div className="tile-permissions-empty">No tiles match this filter.</div>}
    </section>
  </main>;
}
