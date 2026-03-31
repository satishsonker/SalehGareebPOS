import config from '../config';
import { formatApiErrorMessage, parseApiValidationErrors } from './apiError';

const readResponseBody = async (response) => {
  const text = await response.text();
  const t = text.trim();
  if (!t) return text;
  const first = t[0];
  if ((first === '{' && t.endsWith('}')) || (first === '[' && t.endsWith(']'))) {
    try {
      return JSON.parse(t);
    } catch {
      return text;
    }
  }
  return text;
};


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

    const responseData = await readResponseBody(response);

    if (!response.ok) {
      const errorMessage = formatApiErrorMessage(
        responseData,
        response.statusText,
        response.status
      );

      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData;
      const validationErrors = parseApiValidationErrors(responseData);
      if (validationErrors) {
        error.validationErrors = validationErrors;
      }
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
