import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiLogOut, FiShoppingBag, FiShield,
  FiUser, FiMail, FiPhone, FiMapPin, FiTag,
  FiChevronDown, FiHome
} from 'react-icons/fi';
import config from '../config';
import './PublicLayout.css';
import { apiBasePath } from '../services/api/commonApi';
import { NotificationBell } from '../components/Notification';
import SystemNotificationBanner from '../components/SystemNotificationBanner/SystemNotificationBanner';

function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, selectedShop } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
    : '?';

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="ph-container">

          {/* Left — logo + shop name */}
          <div className="ph-brand">
            <img src={`${apiBasePath}/logo/logo.png`} alt="Logo" className="ph-logo" />
            <div className="ph-shop-info">
              <span className="ph-shop-name">
                {selectedShop?.name || 'No Shop Selected'}
              </span>
              {selectedShop?.code && (
                <span className="ph-shop-code">{selectedShop.code}</span>
              )}
            </div>
          </div>

          {/* Right — icon actions */}
          <nav className="ph-nav">

            {/* Change Shop */}
            <button
              className="ph-icon-btn"
              onClick={() => navigate('/shop/selection')}
              title="Change Shop"
            >
              <FiShoppingBag />
            </button>

            {/* Admin Panel — only for admins */}
            {isAdmin && (
              <button
                className={`ph-icon-btn${location.pathname.startsWith('/admin') ? ' ph-icon-btn--active' : ''}`}
                onClick={() => navigate('/admin')}
                title="Admin Panel"
              >
                <FiShield />
              </button>
            )}

            {/* Home */}
            <button
              className={`ph-icon-btn${location.pathname === '/' ? ' ph-icon-btn--active' : ''}`}
              onClick={() => navigate('/')}
              title="Home"
            >
              <FiHome />
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User menu */}
            <div className="ph-user-menu" ref={userMenuRef}>
              <button
                className={`ph-avatar-btn${userMenuOpen ? ' ph-avatar-btn--open' : ''}`}
                onClick={() => setUserMenuOpen((o) => !o)}
                title="Account"
              >
                <span className="ph-avatar">{userInitials}</span>
                <FiChevronDown className="ph-avatar-chevron" />
              </button>

              {userMenuOpen && (
                <div className="ph-dropdown">

                  {/* User section */}
                  <div className="ph-dropdown-section">
                    <p className="ph-dropdown-section-title">Account</p>
                    <div className="ph-dropdown-row">
                      <FiUser className="ph-dropdown-icon" />
                      <span>{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className="ph-dropdown-row">
                      <FiMail className="ph-dropdown-icon" />
                      <span>{user?.email || '—'}</span>
                    </div>
                    {user?.phone && (
                      <div className="ph-dropdown-row">
                        <FiPhone className="ph-dropdown-icon" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user?.role && (
                      <div className="ph-dropdown-row">
                        <FiShield className="ph-dropdown-icon" />
                        <span className="ph-dropdown-role">{user.role}</span>
                      </div>
                    )}
                  </div>

                  <div className="ph-dropdown-divider" />

                  {/* Shop section */}
                  <div className="ph-dropdown-section">
                    <p className="ph-dropdown-section-title">Active Shop</p>
                    {selectedShop ? (
                      <>
                        <div className="ph-dropdown-row">
                          <FiShoppingBag className="ph-dropdown-icon" />
                          <span>{selectedShop.name}</span>
                        </div>
                        <div className="ph-dropdown-row">
                          <FiTag className="ph-dropdown-icon" />
                          <span>{selectedShop.code}</span>
                        </div>
                        {selectedShop.address && (
                          <div className="ph-dropdown-row">
                            <FiMapPin className="ph-dropdown-icon" />
                            <span>{selectedShop.address}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="ph-dropdown-row ph-dropdown-row--muted">
                        <FiShoppingBag className="ph-dropdown-icon" />
                        <span>No shop selected</span>
                      </div>
                    )}
                  </div>

                  <div className="ph-dropdown-divider" />

                  {/* Logout */}
                  <button className="ph-dropdown-logout" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>

                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <SystemNotificationBanner />

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="ph-container">
          <p>&copy; {new Date().getFullYear()} {config.app.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
