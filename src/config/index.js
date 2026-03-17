/**
 * Application Configuration
 * 
 * This file centralizes all environment variables and provides
 * a single source of truth for configuration values.
 * 
 * Note: In Create React App, environment variables must be prefixed
 * with REACT_APP_ to be exposed to the browser.
 */

// Get API base URL - use environment variable or default to https://localhost:7194
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Default to https://localhost:7194 as base API path
  return 'https://localhost:7194';
};

const config = {
  // API Configuration
  api: {
    url: getApiUrl(),
    basePath: 'https://localhost:7194',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
  },

  // Application Info
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Saleh Gareeb POS',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  },

  // Feature Flags
  features: {
    analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
  },

  // Payment Configuration
  payment: {
    gatewayUrl: process.env.REACT_APP_PAYMENT_GATEWAY_URL || '',
    publicKey: process.env.REACT_APP_PAYMENT_PUBLIC_KEY || '',
  },

  // External Services
  services: {
    cdnUrl: process.env.REACT_APP_CDN_URL || '',
    uploadMaxSize: parseInt(process.env.REACT_APP_UPLOAD_MAX_SIZE || '5242880', 10), // 5MB default
  },

  // Admin Configuration
  admin: {
    sessionTimeout: parseInt(process.env.REACT_APP_ADMIN_SESSION_TIMEOUT || '3600000', 10), // 1 hour default
    maxLoginAttempts: parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS || '5', 10),
  },

  // Public Configuration
  public: {
    contactEmail: process.env.REACT_APP_CONTACT_EMAIL || 'support@salehgareeb.com',
    contactPhone: process.env.REACT_APP_CONTACT_PHONE || '+1234567890',
    supportUrl: process.env.REACT_APP_SUPPORT_URL || 'https://support.salehgareeb.com',
  },

  // Helper function to check if we're in production
  isProduction: () => {
    return process.env.REACT_APP_ENVIRONMENT === 'production' || 
           process.env.NODE_ENV === 'production';
  },

  // Helper function to check if we're in development
  isDevelopment: () => {
    return process.env.REACT_APP_ENVIRONMENT === 'development' || 
           process.env.NODE_ENV === 'development';
  },
};

// Log configuration in development mode (useful for debugging)
if (config.isDevelopment() && config.features.debugMode) {
  console.log('Application Configuration:', config);
}

export default config;
