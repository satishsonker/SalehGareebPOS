import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAccessibleTiles } from '../services/api/tileApiService';

const normalizePath = value => `/${String(value || '').replace(/^\/+|\/+$/g, '')}`;
const unwrap = response => response?.data?.data ?? response?.data ?? response;

export default function TileAccessRoute({ children }) {
  const location = useLocation();
  const { selectedShop } = useAuth();
  const [state, setState] = useState({ shopId: null, loading: true, allowed: false });
  const shopId = selectedShop?.id ?? null;

  useEffect(() => {
    let active = true;
    if (!shopId) {
      setState({ shopId, loading: false, allowed: false });
      return () => { active = false; };
    }
    setState({ shopId, loading: true, allowed: false });
    getAccessibleTiles().then(response => {
      if (!active) return;
      const tiles = unwrap(response);
      const allowed = (Array.isArray(tiles) ? tiles : []).some(tile => normalizePath(tile.path) === normalizePath(location.pathname));
      setState({ shopId, loading: false, allowed });
    }).catch(() => {
      if (active) setState({ shopId, loading: false, allowed: false });
    });
    return () => { active = false; };
  }, [shopId, location.pathname]);

  if (state.shopId !== shopId || state.loading) return <div className="route-access-loading" role="status">Checking tile access…</div>;
  if (!state.allowed) return <Navigate to="/" replace state={{ from: location.pathname, denied: true }} />;
  return children;
}
