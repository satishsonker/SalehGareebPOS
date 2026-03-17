import React from 'react';
import './AdminPages.css';

function Settings() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Settings</h2>
      </div>
      <div className="settings-container">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="form-group">
            <label>Store Name</label>
            <input type="text" defaultValue="Saleh Gareeb POS" />
          </div>
          <div className="form-group">
            <label>Store Email</label>
            <input type="email" defaultValue="info@salehgareeb.com" />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
        <div className="settings-section">
          <h3>Security</h3>
          <div className="form-group">
            <label>Change Password</label>
            <input type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm new password" />
          </div>
        </div>
        <div className="settings-actions">
          <button className="btn-primary">Save Changes</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
