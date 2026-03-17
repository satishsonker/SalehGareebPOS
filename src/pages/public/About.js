import React from 'react';
import config from '../../config';
import './PublicPages.css';

function About() {
  return (
    <div className="public-page">
      <div className="page-container">
        <h1>About Us</h1>
        <div className="content-section">
          <p>
            {config.app.name} is a comprehensive Point of Sale solution designed
            to help businesses manage their sales, inventory, and operations efficiently.
          </p>
          <h2>Our Mission</h2>
          <p>
            To provide businesses with a powerful, easy-to-use POS system that
            streamlines operations and enhances customer experience.
          </p>
          <h2>Features</h2>
          <ul>
            <li>Real-time inventory management</li>
            <li>Sales tracking and reporting</li>
            <li>Customer management</li>
            <li>Multi-user support</li>
            <li>Secure payment processing</li>
          </ul>
          <h2>Contact Us</h2>
          <p>
            Email: <a href={`mailto:${config.public.contactEmail}`}>{config.public.contactEmail}</a><br />
            Phone: {config.public.contactPhone}<br />
            Support: <a href={config.public.supportUrl} target="_blank" rel="noopener noreferrer">Visit Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
