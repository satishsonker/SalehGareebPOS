import React from 'react';
import './PublicPages.css';

function Home() {
  return (
    <div className="public-page">
      <div className="page-container">
        <h1>Welcome to Saleh Gareeb POS</h1>
        <p className="subtitle">Your Point of Sale Solution</p>
        <div className="features">
          <div className="feature-card">
            <h3>Easy to Use</h3>
            <p>Simple and intuitive interface for all your POS needs.</p>
          </div>
          <div className="feature-card">
            <h3>Fast & Reliable</h3>
            <p>Lightning-fast performance with reliable data management.</p>
          </div>
          <div className="feature-card">
            <h3>Secure</h3>
            <p>Your data is safe with our secure system architecture.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
