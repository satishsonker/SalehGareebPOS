import React from 'react';
import './AdminPages.css';

function Dashboard() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">$12,450</p>
          <span className="stat-change positive">+12% from last month</span>
        </div>
        <div className="stat-card">
          <h3>Orders</h3>
          <p className="stat-value">156</p>
          <span className="stat-change positive">+8% from last month</span>
        </div>
        <div className="stat-card">
          <h3>Products</h3>
          <p className="stat-value">342</p>
          <span className="stat-change">No change</span>
        </div>
        <div className="stat-card">
          <h3>Customers</h3>
          <p className="stat-value">1,234</p>
          <span className="stat-change positive">+5% from last month</span>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="content-card">
          <h3>Recent Orders</h3>
          <p>Order management and tracking will be displayed here.</p>
        </div>
        <div className="content-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn">Add Product</button>
            <button className="action-btn">New Order</button>
            <button className="action-btn">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
