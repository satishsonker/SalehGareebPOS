import React, { createContext, useContext, useEffect, useState } from 'react';

const ApiLoaderContext = createContext(null);

let activeRequests = 0;
const listeners = new Set();

const emitLoadingState = () => {
  const isLoading = activeRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
};

export const notifyApiRequestStart = () => {
  activeRequests += 1;
  emitLoadingState();
};

export const notifyApiRequestEnd = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  emitLoadingState();
};

export const ApiLoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const listener = (nextLoadingState) => setIsLoading(nextLoadingState);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const value = { isLoading };

  return (
    <ApiLoaderContext.Provider value={value}>
      {children}
    </ApiLoaderContext.Provider>
  );
};

export const useApiLoader = () => {
  const context = useContext(ApiLoaderContext);

  if (!context) {
    throw new Error('useApiLoader must be used within an ApiLoaderProvider');
  }

  return context;
};
