import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// CRA serves files from /public at the site root in production. Registering
// here keeps development behavior unchanged and enables installability over HTTPS.
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
