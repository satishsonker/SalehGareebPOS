import { get, post, del } from '../../utils/api';

/**
 * Access Control API Service
 * Handles user access control, shop access, and menu access management
 */

// Get user access information
export const getUserAccess = (userId) => {
  return get(`/AccessControl/user/${userId}`);
};

// Grant shop access to a role
export const grantShopAccess = (data) => {
  return post('/AccessControl/shop-access', data);
};

// Grant menu access to a role
export const grantMenuAccess = (data) => {
  return post('/AccessControl/menu-access', data);
};

// Remove shop access from a role
export const removeShopAccess = (roleId, shopId) => {
  return del(`/AccessControl/shop-access/${roleId}/${shopId}`);
};

// Remove menu access from a role
export const removeMenuAccess = (roleId, shopId, menuId) => {
  return del(`/AccessControl/menu-access/${roleId}/${shopId}/${menuId}`);
};

export const getShopAccessByUser = (userId) => {
  return del(`/AccessControl/shop-access/by/user/${userId}`);
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
