import { get, post, del } from '../../utils/api';

/**
 * Access Control API Service
 * Handles user access control, shop access, and menu access management
 */
const API_CONTROLLER = '/AccessControl';
// Get user access information
export const getUserAccess = (userId) => {
  return get(`${API_CONTROLLER}/user/${userId}`);
};

// Grant shop access to a user
export const grantShopAccess = (data) => {
  return post(`${API_CONTROLLER}/grant/access/shop`, data);
};

export const getAllShopAccess = () => {
  return get(`${API_CONTROLLER}/shop-access/get/all`);
};

export const grantBulkShopAccess = (data) => {
  return post(`${API_CONTROLLER}/grant/access/shop/bulk`, data);
};

// Grant menu access to a role
export const grantMenuAccess = (data) => {
  return post(`${API_CONTROLLER}/grant/access/menu`, data);
};

// Revoke shop access from a user
export const removeShopAccess = (userId, shopId) => {
  return del(`${API_CONTROLLER}/revoke/access/shop/${userId}/${shopId}`);
};

// Remove menu access from a role
export const removeMenuAccess = (roleId, shopId, menuId) => {
  return del(`${API_CONTROLLER}/menu-access/${roleId}/${shopId}/${menuId}`);
};
export const getShopAccessByUser = (userId) => {
  return post(`${API_CONTROLLER}/shop-access/by/user/${userId}`);
};


// Check if user has access to a shop/menu
export const checkAccess = (params) => {
  const queryParams = new URLSearchParams();
  if (params.shopId) queryParams.append('shopId', params.shopId);
  if (params.menuCode) queryParams.append('menuCode', params.menuCode);
  if (params.subMenuCode) queryParams.append('subMenuCode', params.subMenuCode);
  
  const queryString = queryParams.toString();
  return get(`/AccessControl/check-access${queryString ? `?${queryString}` : ''}`);
};
