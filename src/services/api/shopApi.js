import { get, post, put, del, apiRequest } from '../../utils/api';

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

// Upload shop image
export const uploadShopPicture = (shopId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest(`/shops/${shopId}/shop-picture`, {
    method: 'POST',
    body: formData,
  });
};

// Delete shop image
export const deleteShopPicture = (shopId) => {
  return del(`/shops/${shopId}/shop-picture`);
};
