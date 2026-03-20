import { get, post, put, del } from '../../utils/api';

// Get all shops
export const getShops = (pageNo, pageSize) => {
  return get(`/shops?pageNo=${pageNo}&pageSize=${pageSize}`);
};

// Get shop by ID
export const getShopById = (id) => {
  return get(`/shops/${id}`);
};

// Create a new shop
export const createShop = (data) => {
  return post('/shops', data);
};

// Update a shop
export const updateShop = (id, data) => {
  return put(`/shops/${id}`, data);
};

// Delete a shop
export const deleteShop = (id) => {
  return del(`/shops/${id}`);
};
