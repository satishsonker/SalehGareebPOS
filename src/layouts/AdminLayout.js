import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiGrid, 
  FiDatabase,
  FiPackage, 
  FiShoppingCart, 
  FiSettings, 
  FiLogOut,
  FiSun,
  FiMoon,
  FiHome
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const menuItems = [
    { path: '/admin', icon: FiGrid, label: 'Dashboard' },
    { path: '/admin/master-data', icon: FiDatabase, label: 'Master Data' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2>Admin Panel</h2>}
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarCollapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches or starts with menu item path
            const isActive = location.pathname === item.path || 
                           (item.path !== '/admin' && location.pathname.startsWith(item.path));
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
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <FiLogOut className="logout-icon" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="header-left">
              <h1>Admin Dashboard</h1>
            </div>
            <div className="header-right">
              {user && (
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  {user.roleName && (
                    <span className="user-role">{user.roleName}</span>
                  )}
                </div>
              )}
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <FiSun /> : <FiMoon />}
              </button>
              <Link to="/" className="back-to-public">
                <FiHome />
                <span>Back to Public</span>
              </Link>
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
