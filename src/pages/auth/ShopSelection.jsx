import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowRight, FiCheck, FiLogOut, FiMapPin, FiRefreshCw, FiSearch, FiShoppingBag, FiShield } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import { getShopAccessByUser } from '../../services/api/accessControlApi';
import { jwtDecode } from 'jwt-decode';
import './ShopSelection.css';

const fallbackLogo = `${apiBasePath}/assets/images/default-shop-image.jpg`;

function unwrapShops(response) {
  const envelope = response?.data && response.data.success !== undefined ? response.data : response;
  const payload = envelope?.data ?? envelope ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.shops)) return payload.shops;
  return [];
}

function shopLocation(shop) {
  return [shop.address1, shop.address2, shop.address3, shop.city, shop.country]
    .map(value => String(value || '').trim())
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ');
}

function ShopSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedShop, setSelectedShop, logout } = useAuth();
  const [error, setError] = useState('');
  const [shopList, setShopList] = useState([]);
  const [userData, setUserData] = useState({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async userId => {
    setLoading(true);
    setError('');
    try {
      const response = await getShopAccessByUser(userId, true);
      setShopList(unwrapShops(response));
    } catch (requestError) {
      setShopList([]);
      setError(requestError?.message || 'Could not load your shops. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const claims = jwtDecode(token);
      const user = {
        userId: claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        firstName: claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        lastName: claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
        role: claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      };
      setUserData(user);
      if (user.userId) fetchShops(user.userId);
      else {
        setError('Your account could not be identified. Please sign in again.');
        setLoading(false);
      }
    } catch {
      setError('Your session has expired. Please sign in again.');
      setLoading(false);
      navigate('/login', { replace: true });
    }
  }, [fetchShops, navigate]);

  const filteredShops = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return shopList;
    return shopList.filter(shop => [shop.shopName, shop.name, shop.shopNameAr, shop.city, shop.country, shopLocation(shop)]
      .some(value => String(value || '').toLowerCase().includes(term)));
  }, [query, shopList]);

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!selectedShop) {
      setError('Select a shop to continue.');
      return;
    }
    localStorage.setItem('selectedShop', JSON.stringify(selectedShop));
    window.location.replace(location.state?.from || '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return <main className="shopselect-page">
    <div className="shopselect-shell">
      <aside className="shopselect-side">
        <div className="shopselect-brand"><span className="shopselect-brand__mark"><FiShoppingBag /></span><span><strong>Saleh Gareeb</strong><small>Point of Sale</small></span></div>
        <div className="shopselect-side__message"><span className="shopselect-kicker"><FiShield /> SECURE WORKSPACE</span><h1>Choose your shop</h1><p>Select the location you want to work in. Your orders and sales will be connected to that shop.</p></div>
        <div className="shopselect-side__foot"><span className="shopselect-side__status" /><span>Protected account access</span></div>
      </aside>

      <section className="shopselect-main">
        <header className="shopselect-topbar">
          <div><span className="shopselect-step">WORKSPACE SETUP <b> / </b> SHOP</span><h2>Available locations</h2><p>Choose a shop to continue to the POS.</p></div>
          <div className="shopselect-account"><span className="shopselect-account__avatar">{(userData.firstName || 'U').slice(0, 1).toUpperCase()}</span><span><small>Signed in as</small><strong>{[userData.firstName, userData.lastName].filter(Boolean).join(' ') || 'User'}</strong></span></div>
        </header>

        <form onSubmit={handleSubmit} className="shopselect-form">
          <label className="shopselect-search"><FiSearch /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search shop name or location" aria-label="Search shops" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>
          {error && <div className="shopselect-message shopselect-message--error" role="alert"><span>{error}</span>{!loading && <button type="button" onClick={() => userData.userId && fetchShops(userData.userId)}><FiRefreshCw /> Retry</button>}</div>}

          {loading ? <div className="shopselect-state"><span className="shopselect-spinner" /><strong>Loading shops</strong><small>Getting the locations assigned to your account.</small></div> : filteredShops.length > 0 ? <>
            <div className="shopselect-result-heading"><strong>{query ? `${filteredShops.length} matching ${filteredShops.length === 1 ? 'shop' : 'shops'}` : `${shopList.length} ${shopList.length === 1 ? 'shop' : 'shops'} available`}</strong><span>Select one shop</span></div>
            <div className="shopselect-grid">
              {filteredShops.map((shop, index) => {
                const isSelected = String(selectedShop?.id) === String(shop.id);
                const locationText = shopLocation(shop) || shop.location || 'Location not provided';
                return <button key={shop.id || index} type="button" className={`shopselect-card ${isSelected ? 'is-selected' : ''}`} aria-pressed={isSelected} onClick={() => { setSelectedShop(shop); setError(''); }}>
                  <span className="shopselect-card__logo"><img src={shop.userImageThumbPath ? `${apiBasePath}${shop.userImageThumbPath}` : fallbackLogo} alt="" onError={event => { if (!event.currentTarget.src.endsWith('/default-shop-image.jpg')) event.currentTarget.src = fallbackLogo; }} /></span>
                  <span className="shopselect-card__info"><strong>{shop.shopName || shop.name || 'Shop'}</strong>{shop.shopNameAr && <small dir="rtl">{shop.shopNameAr}</small>}<span><FiMapPin />{locationText}</span>{(shop.poBox || shop.PoBox) && <small>P.O. Box {shop.poBox || shop.PoBox}</small>}</span>
                  <span className={`shopselect-card__choice ${isSelected ? 'is-selected' : ''}`}>{isSelected ? <><FiCheck /> Selected</> : 'Select'}</span>
                </button>;
              })}
            </div>
            </> : <div className="shopselect-state shopselect-state--empty"><span className="shopselect-empty-icon"><FiShoppingBag /></span><strong>{query ? 'No shops match your search' : 'No shops assigned yet'}</strong><small>{query ? 'Try another shop name or location.' : 'Contact your administrator to request access to a shop.'}</small>{query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}</div>}

          <footer className="shopselect-footer"><span>Shop access is managed by your administrator.</span>{!loading && shopList.length === 0 && <button type="button" className="shopselect-logout" onClick={handleLogout}><FiLogOut /> Log out</button>}<button type="submit" className="shopselect-continue" disabled={!selectedShop || loading}><span>Continue to POS</span><FiArrowRight /></button></footer>
        </form>
      </section>
    </div>
  </main>;
}

export default ShopSelection;
