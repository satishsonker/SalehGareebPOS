import React, { useState, useEffect } from 'react';
import { FiDatabase, FiShoppingBag, FiUsers, FiShield, FiKey } from 'react-icons/fi';
import ShopsMasterData from './masterData/ShopsMasterData';
import RolesMasterData from './masterData/RolesMasterData';
import UsersMasterData from './masterData/UsersMasterData';
import MasterData from './masterData/MasterData';
import UserShopAccess from './masterData/UserShopAccess';
import './AdminPages.css';
import './SystemData.css';
import './masterData/masterData.global.css';

function SystemData() {
  const [activeTab, setActiveTab] = useState('shops');
  const [error, setError] = useState(null);
  const tabs = [
    { id: 'shops', label: 'Shops', icon: FiShoppingBag },
    { id: 'roles', label: 'Roles', icon: FiShield },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'master', label: 'Master Data', icon: FiDatabase },
    { id: 'shopAccess', label: 'User Shop Access', icon: FiKey },
  ];

   // Suppress browser extension errors in console
   useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Filter out browser extension connection errors
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('runtime.lastError') || 
           args[0].includes('Could not establish connection') ||
           args[0].includes('Receiving end does not exist'))) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);
  
  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'shops':
          return <ShopsMasterData />;
        case 'roles':
          return <RolesMasterData />;
        case 'users':
          return <UsersMasterData />;
        case 'master':
          return <MasterData />;
        case 'shopAccess':
          return <UserShopAccess />;
        default:
          return <ShopsMasterData />;
      }
    } catch (err) {
      setError(err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
          <h3>Error loading {activeTab} data</h3>
          <p>{err.message}</p>
          <button onClick={() => setError(null)}>Retry</button>
        </div>
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-left">
          <FiDatabase className="page-icon" />
          <h2>Master Data</h2>
        </div>
      </div>

      <div className="master-data-container">
        <div className="master-data-tabs">
          {tabs?.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="master-data-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default SystemData;
