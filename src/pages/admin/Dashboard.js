import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBell,
  FiChevronRight,
  FiDatabase,
  FiDollarSign,
  FiServer,
  FiSettings,
  FiShield,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const adminSections = [
  {
    title: 'Shop setup',
    description: 'Maintain the data used by your shop and sales workflow.',
    tools: [
      { title: 'System data', description: 'Manage statuses, types, and shared lookup values.', path: '/admin/system-data', icon: FiDatabase, tone: 'blue' },
      { title: 'Customers', description: 'Review and maintain customer records.', path: '/admin/customers', icon: FiUsers, tone: 'teal' },
      { title: 'Order prices', description: 'Set garment prices, grades, and crystal quantities.', path: '/admin/order-prices', icon: FiDollarSign, tone: 'amber' }
    ]
  },
  {
    title: 'Platform tools',
    description: 'Review system messages and manage application settings.',
    tools: [
      { title: 'Notifications', description: 'Publish and review system notifications.', path: '/admin/notifications', icon: FiBell, tone: 'violet' },
      { title: 'Cache management', description: 'Refresh cached data used throughout the app.', path: '/admin/cache', icon: FiServer, tone: 'slate' },
      { title: 'Settings', description: 'Configure administrative and application preferences.', path: '/admin/settings', icon: FiSettings, tone: 'blue' }
    ]
  }
];

function Dashboard() {
  const { selectedShop } = useAuth();
  const shopName = selectedShop?.shopName || selectedShop?.name || 'Your shop';

  return (
    <div className="admin-home">
      <section className="admin-home-welcome">
        <div className="admin-home-welcome__copy">
          <span className="admin-home-eyebrow"><FiShield /> ADMIN WORKSPACE</span>
          <h2>Administration</h2>
          <p>Manage the settings and records that support your daily shop operations.</p>
        </div>
        <div className="admin-home-shop">
          <span className="admin-home-shop__label">ACTIVE SHOP</span>
          <strong>{shopName}</strong>
          {selectedShop?.code && <small>{selectedShop.code}</small>}
        </div>
      </section>

      <div className="admin-home-sections">
        {adminSections.map(section => (
          <section className="admin-home-section" key={section.title}>
            <header className="admin-home-section__header">
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <span>{section.tools.length} tools</span>
            </header>
            <div className="admin-home-grid">
              {section.tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <Link className="admin-tool-card" to={tool.path} key={tool.path}>
                    <span className={`admin-tool-card__icon admin-tool-card__icon--${tool.tone}`}><Icon /></span>
                    <span className="admin-tool-card__copy">
                      <strong>{tool.title}</strong>
                      <small>{tool.description}</small>
                    </span>
                    <FiChevronRight className="admin-tool-card__arrow" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
