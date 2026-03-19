import { get, post, put, del } from '../../utils/api';

/**
 * Admin API Service
 * Handles shops, roles, users, and permissions management
 */

// ==================== Shops ====================

// Get all shops
export const getShops = () => {
  return get('/Admin/shops');
};

// Get shop by ID
export const getShopById = (id) => {
  return get(`/Admin/shops/${id}`);
};

// Create a new shop
export const createShop = (data) => {
  return post('/Admin/shops', data);
};

// Update a shop
export const updateShop = (id, data) => {
  return put(`/Admin/shops/${id}`, data);
};

// Delete a shop
export const deleteShop = (id) => {
  return del(`/Admin/shops/${id}`);
};

// ==================== User-Shop Assignment ====================

// Assign user to shop
export const assignUserToShop = (data) => {
  return post('/Admin/users/assign-shop', data);
};

// Update user-shop assignment
export const updateUserShopAssignment = (data) => {
  return put('/Admin/users/assign-shop', data);
};

// Remove user from shop
export const removeUserFromShop = (userId, shopId) => {
  return del(`/Admin/users/${userId}/shops/${shopId}`);
};

// ==================== Role Permissions ====================

// Assign menu permission to role
export const assignRoleMenuPermission = (data) => {
  return post('/Admin/roles/menu-permissions', data);
};

// Assign submenu permission to role
export const assignRoleSubMenuPermission = (data) => {
  return post('/Admin/roles/submenu-permissions', data);
};

// ==================== User Permissions ====================

// Assign menu permission to user
export const assignUserMenuPermission = (data) => {
  return post('/Admin/users/menu-permissions', data);
};

// Assign submenu permission to user
export const assignUserSubMenuPermission = (data) => {
  return post('/Admin/users/submenu-permissions', data);
};

// Remove menu permission from user
export const removeUserMenuPermission = (userId, shopId, menuId) => {
  return del(`/Admin/users/${userId}/shops/${shopId}/menus/${menuId}/permissions`);
};

// Remove submenu permission from user
export const removeUserSubMenuPermission = (userId, shopId, subMenuId) => {
  return del(`/Admin/users/${userId}/shops/${shopId}/submenus/${subMenuId}/permissions`);
};
