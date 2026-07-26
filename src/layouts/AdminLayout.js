import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiGrid, FiDatabase, FiPackage, FiShoppingCart,
  FiSettings, FiLogOut, FiSun, FiMoon, FiCode,
  FiUser, FiMail, FiPhone, FiShield,
  FiShoppingBag, FiMapPin, FiTag, FiChevronDown, FiHome, FiDollarSign, FiBell, FiServer, FiBox
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from '../components/Notification';
import './AdminLayout.css';

const menuItems = [
  { path: '/admin',                   icon: FiGrid,         label: 'Dashboard' },
  { path: '/admin/system-data',       icon: FiDatabase,     label: 'System Data' },
  { path: '/admin/customers',         icon: FiUser,         label: 'Customers' },
  { path: '/admin/order-prices',      icon: FiDollarSign,   label: 'Order Prices' },
  { path: '/admin/notifications',     icon: FiBell,         label: 'Notifications' },
  { path: '/admin/design-models',     icon: FiBox,          label: 'Design Models' },
  { path: '/admin/cache',             icon: FiServer,       label: 'Cache' },
  { path: '/admin/products',          icon: FiPackage,      label: 'Products' },
  { path: '/admin/orders',            icon: FiShoppingCart, label: 'Orders' },
  { path: '/admin/settings',          icon: FiSettings,     label: 'Settings' },
  { path: '/admin/components-example',icon: FiCode,         label: 'Components' },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { logout, user, selectedShop } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close dropdown on click-outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Derive current page title from active menu item
  const activeMenu = menuItems.find((item) =>
    item.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = activeMenu?.label || 'Admin Panel';

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
    : '?';

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2>Admin Panel</h2>}
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Toggle sidebar">
            {sidebarCollapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="nav-icon" />
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title={sidebarCollapsed ? 'Logout' : ''}>
            <FiLogOut className="logout-icon" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="admin-content">

        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-content">

            {/* Page title */}
            <div className="header-left">
              <h1 className="admin-page-title">{pageTitle}</h1>
            </div>

            {/* Right actions */}
            <div className="header-right">

              {/* Theme toggle */}
              <button
                className="ah-icon-btn"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <FiSun /> : <FiMoon />}
              </button>

              {/* Notifications */}
              <NotificationBell />

              {/* Back to Public */}
              <button
                className="ah-icon-btn"
                onClick={() => navigate('/')}
                title="Back to Public"
              >
                <FiHome />
              </button>

              {/* User menu */}
              <div className="ah-user-menu" ref={userMenuRef}>
                <button
                  className={`ah-avatar-btn${userMenuOpen ? ' ah-avatar-btn--open' : ''}`}
                  onClick={() => setUserMenuOpen((o) => !o)}
                  title="Account"
                >
                  <span className="ah-avatar">{userInitials}</span>
                  <div className="ah-avatar-info">
                    <span className="ah-avatar-name">{user?.firstName} {user?.lastName}</span>
                    {user?.role && <span className="ah-avatar-role">{user.role}</span>}
                  </div>
                  <FiChevronDown className="ah-avatar-chevron" />
                </button>

                {userMenuOpen && (
                  <div className="ah-dropdown">

                    {/* User section */}
                    <div className="ah-dropdown-section">
                      <p className="ah-dropdown-section-title">Account</p>
                      <div className="ah-dropdown-row">
                        <FiUser className="ah-dropdown-icon" />
                        <span>{user?.firstName} {user?.lastName}</span>
                      </div>
                      <div className="ah-dropdown-row">
                        <FiMail className="ah-dropdown-icon" />
                        <span>{user?.email || '—'}</span>
                      </div>
                      {user?.phone && (
                        <div className="ah-dropdown-row">
                          <FiPhone className="ah-dropdown-icon" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user?.role && (
                        <div className="ah-dropdown-row">
                          <FiShield className="ah-dropdown-icon" />
                          <span className="ah-dropdown-role">{user.role}</span>
                        </div>
                      )}
                    </div>

                    <div className="ah-dropdown-divider" />

                    {/* Shop section */}
                    <div className="ah-dropdown-section">
                      <p className="ah-dropdown-section-title">Active Shop</p>
                      {selectedShop ? (
                        <>
                          <div className="ah-dropdown-row">
                            <FiShoppingBag className="ah-dropdown-icon" />
                            <span>{selectedShop.name}</span>
                          </div>
                          <div className="ah-dropdown-row">
                            <FiTag className="ah-dropdown-icon" />
                            <span>{selectedShop.code}</span>
                          </div>
                          {selectedShop.address && (
                            <div className="ah-dropdown-row">
                              <FiMapPin className="ah-dropdown-icon" />
                              <span>{selectedShop.address}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="ah-dropdown-row ah-dropdown-row--muted">
                          <FiShoppingBag className="ah-dropdown-icon" />
                          <span>No shop selected</span>
                        </div>
                      )}
                    </div>

                    <div className="ah-dropdown-divider" />

                    {/* Logout */}
                    <button className="ah-dropdown-logout" onClick={handleLogout}>
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>

                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
