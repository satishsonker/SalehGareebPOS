import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTiles } from '../../services/api/tileApiService';
import * as FiIcons from 'react-icons/fi';
import './Home.css';

let LARGE_TILES = [];

// [
//   { id: 'createOrder', label: 'Create Order', icon: FiShoppingCart, color: '#2563eb', path: '/orders/create' },
//   { id: 'fabricSale', label: 'Fabric Sale', icon: FiClock, color: '#ea580c', path: '/fabric/sale' },
//   { id: 'alteration', label: 'Alteration', icon: FiBarChart2, color: '#7c3aed', path: '/orders/alteration' },
//   { id: 'searchOrders', label: 'Search Orders', icon: FiSearch, color: '#1e293b', path: '/orders/search' },
//   { id: 'orderAlert', label: 'Order Alerts', icon: FiCheckCircle, color: '#16a34a', path: '/orders/alerts' },
//   { id: 'advance', label: 'Advance', icon: FiDollarSign, color: '#dc2626', path: '/orders/advance' },
// ];

let SMALL_TILES = []

// [
//   { id: 'customers', label: 'Customers', subtitle: 'Manage customers', icon: FiUsers, color: '#0891b2', path: '/customers' },
//   { id: 'updateImage', label: 'Update Image', subtitle: 'Update product images', icon: FiImage, color: '#d97706', path: '/products/images' },
//   { id: 'cancelOrder', label: 'Cancel Order', subtitle: 'Cancel existing orders', icon: FiXCircle, color: '#be123c', path: '/orders/cancel' },
// ];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function LargeTile({ tile, onClick }) {
  const Icon = FiIcons[tile.icon];
  return (
    <button
      className="home-tile home-tile--large"
      style={{ '--tile-color': tile.color }}
      onClick={() => onClick(tile.path)}
    >
      <span className="home-tile__circle home-tile__circle--1" />
      <span className="home-tile__circle home-tile__circle--2" />
      <span className="home-tile__icon"><Icon size={36} /></span>
      <span className="home-tile__label">{tile.label}</span>
    </button>
  );
}

function SmallTile({ tile, onClick }) {
  const Icon = FiIcons[tile.icon];
  return (
    <button
      className="home-tile home-tile--small"
      style={{ '--tile-color': tile.color }}
      onClick={() => onClick(tile.path)}
    >
      <span className="home-tile__circle home-tile__circle--1" />
      <span className="home-tile__circle home-tile__circle--2" />
      <span className="home-tile__icon"><Icon size={28} /></span>
      <span className="home-tile__label">{tile.label}</span>
      {tile.subtitle && <span className="home-tile__subtitle">{tile.subtitle}</span>}
    </button>
  );
}

function Home() {
  const navigate = useNavigate();
  const { user, selectedShop } = useAuth();

  const greeting = useMemo(() => getGreeting(), []);
  const dateStr = useMemo(() => formatDate(), []);

  const firstName = user?.firstName || user?.username || 'User';
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const fetchTiles = async () => {
      try {
        const response = await getTiles();
        setTiles(response.data?.data || []);
        LARGE_TILES=response.data?.data?.filter(tile => tile.size?.toLowerCase() === 'large') || [];
        SMALL_TILES=response.data?.data?.filter(tile => tile.size?.toLowerCase() === 'small') || [];
      } catch (error) {
        console.error('Error fetching tiles:', error);
      }
    };

    fetchTiles();
  }, []);

  return (
    <div className="home-root">
      {/* Greeting bar */}
      <div className="home-greeting">
        <div>
          <h2 className="home-greeting__title">{greeting}, {firstName}</h2>
          <p className="home-greeting__date">{dateStr}</p>
        </div>
        {selectedShop && (
          <div className="home-greeting__shop">
            <span className="home-greeting__shop-label">Current Shop</span>
            <span className="home-greeting__shop-name">{selectedShop.shopName || selectedShop.name}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      {/* <div className="home-stats">
        <div className="home-stat-card">
          <span className="home-stat-card__value">0</span>
          <span className="home-stat-card__label">Daily Sales</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-card__value">0</span>
          <span className="home-stat-card__label">Pending Orders</span>
        </div>
        <div className="home-stat-card home-stat-card--warn">
          <span className="home-stat-card__value">0</span>
          <span className="home-stat-card__label">Late Orders</span>
        </div>
      </div> */}

      {/* Large tile grid */}
      <div className="home-grid home-grid--large">
        {LARGE_TILES.map(tile => (
          <LargeTile key={tile.id} tile={tile} onClick={navigate} />
        ))}
      </div>

      {/* Small tile grid */}
      <div className="home-grid home-grid--small">
        {SMALL_TILES.map(tile => (
          <SmallTile key={tile.id} tile={tile} onClick={navigate} />
        ))}
      </div>
    </div>
  );
}

export default Home;
