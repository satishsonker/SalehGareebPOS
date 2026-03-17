import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import config from '../config';
import './PublicLayout.css';

function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container">
          <div className="logo">
            <h2>{config.app.name}</h2>
          </div>
          <nav className="public-nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? 'active' : ''}
            >
              About
            </Link>
            {user?.isAdmin && (
              <Link 
                to="/admin" 
                className={location.pathname.startsWith('/admin') ? 'active' : ''}
              >
                Admin
              </Link>
            )}
            {user && (
              <div className="user-menu">
                <span className="username">{user.username}</span>
                <button 
                  className="logout-btn-header"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FiLogOut />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {config.app.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
