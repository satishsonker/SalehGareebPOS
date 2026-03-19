import config from '../config';

/**
 * API Utility Functions
 * 
 * Centralized API calls using configuration from environment variables
 */

/**
 * Get authentication token from storage
 */
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/api/products')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Ensure endpoint starts with /api
  const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${config.api.url}${apiEndpoint}`;
  
  // Get auth token
  const token = getAuthToken();
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.api.timeout,
  };

  // Add Authorization header if token exists
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Remove Content-Type header for FormData requests
  if (options.body instanceof FormData) {
    delete mergedOptions.headers['Content-Type'];
  }

  // Add timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

  try {
    const response = await fetch(url, {
      ...mergedOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Parse response body
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Try to extract error message from response
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      if (responseData) {
        if (typeof responseData === 'object' && responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'object' && responseData.errors && Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors.join(', ') || errorMessage;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    // If error already has a message, re-throw it
    if (error.message && error.message !== 'Failed to fetch') {
      throw error;
    }
    
    throw error;
  }
};

/**
 * GET request helper
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

export const apiBasePath = config.api.url;
