import React, { useState } from 'react';
import { FiDatabase, FiShoppingBag, FiUsers, FiShield } from 'react-icons/fi';
import ShopsMasterData from './masterData/ShopsMasterData';
import RolesMasterData from './masterData/RolesMasterData';
import UsersMasterData from './masterData/UsersMasterData';
import './AdminPages.css';
import './MasterData.css';

function MasterData() {
  const [activeTab, setActiveTab] = useState('shops');

  const tabs = [
    { id: 'shops', label: 'Shops', icon: FiShoppingBag },
    { id: 'roles', label: 'Roles', icon: FiShield },
    { id: 'users', label: 'Users', icon: FiUsers },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shops':
        return <ShopsMasterData />;
      case 'roles':
        return <RolesMasterData />;
      case 'users':
        return <UsersMasterData />;
      default:
        return <ShopsMasterData />;
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
          {tabs.map((tab) => {
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

export default MasterData;
