import React from 'react';
import { FiLoader } from 'react-icons/fi';
import { useApiLoader } from '../../contexts/ApiLoaderContext';
import './GlobalLoader.css';

const GlobalLoader = () => {
  const { isLoading } = useApiLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="global-loader-overlay" aria-live="polite" aria-busy="true">
      <div className="global-loader-panel">
        <div className="global-loader-spinner" aria-hidden="true">
          <FiLoader />
        </div>
        <span className="global-loader-text">Loading...</span>
      </div>
    </div>
  );
};

export default GlobalLoader;
