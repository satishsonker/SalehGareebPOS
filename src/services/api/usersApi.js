import { get, post, put, del,apiBasePath  as apiBaseUrl} from '../../utils/api';

/**
 * Users API Service
 * Handles user authentication, registration, and management
 */

// Register a new user
export const register = (data) => {
  return post('/Users/register', data);
};

// Get all users (if endpoint exists)
export const getUsers = (pageNo,pageSize) => {
  return get(`/Users/get/users?pageNo=${pageNo}&pageSize=${pageSize}`);
};

// Get user by ID
export const getUserById = (id) => {
  return get(`/Users/${id}`);
};

// Update user
export const updateUser = (id, data) => {
  return put(`/Users/${id}`, data);
};

// Delete user
export const deleteUser = (id) => {
  return del(`/Users/${id}`);
};




// Upload profile picture
export const uploadProfilePicture = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost:7194';
  
  return fetch(`${apiUrl}/api/Users/${id}/profile-picture`, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type header, browser will set it with boundary for FormData
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  }).then(response => {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  });
};

// Delete profile picture
export const deleteProfilePicture = (id) => {
  return del(`/Users/${id}/profile-picture`);
};

// Block user
export const blockUser = (id, data) => {
  return post(`/Users/${id}/block`, data);
};

// Unblock user
export const unblockUser = (id) => {
  return post(`/Users/${id}/unblock`);
};

export const apiBasePath = apiBaseUrl;

