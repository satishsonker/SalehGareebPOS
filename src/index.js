import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

function renderApp() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('Root element not found');
    return;
  }
  try {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Error rendering React app', err);
    rootEl.innerHTML = `<div style="font-family: sans-serif; padding: 2rem; color: #900;">
      <h2>Application failed to load</h2>
      <pre style="white-space: pre-wrap;">${String(err)}</pre>
    </div>`;
  }
}

window.addEventListener('error', (e) => {
  console.error('Unhandled error', e.error || e.message, e);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = '<div style="font-family:sans-serif;padding:2rem;color:#900;"><h2>Unhandled error occurred</h2><p>See console for details.</p></div>';
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection', e.reason);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = '<div style="font-family:sans-serif;padding:2rem;color:#900;"><h2>Unhandled promise rejection</h2><p>See console for details.</p></div>';
  }
});

renderApp();
