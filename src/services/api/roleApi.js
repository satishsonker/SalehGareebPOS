import { get, post, put, del } from '../../utils/api';

// Get all roles
export const getRoles = (pageNo=1, pageSize=10) => {
  return get(`/roles/roles?pageNo=${pageNo}&pageSize=${pageSize}`);
};

// Get role by ID
export const getRoleById = (id) => {
  return get(`/roles/roles/${id}`);
};

// Create a new role
export const createRole = (data) => {
  return post('/roles/roles', data);
};

// Update a role
export const updateRole = (id, data) => {
  return put(`/roles/roles/${id}`, data);
};

// Delete a role
export const deleteRole = (id) => {
  return del(`/roles/roles/${id}`);
};