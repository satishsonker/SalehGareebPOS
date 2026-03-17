import { get, post, put, del } from '../../utils/api';

/**
 * Products API Service
 * Handles product CRUD operations
 */

// Get all products
export const getProducts = () => {
  return get('/Products');
};

// Get product by ID
export const getProductById = (id) => {
  return get(`/Products/${id}`);
};

// Create a new product
export const createProduct = (data) => {
  return post('/Products', data);
};

// Update a product
export const updateProduct = (id, data) => {
  return put(`/Products/${id}`, data);
};

// Delete a product
export const deleteProduct = (id) => {
  return del(`/Products/${id}`);
};
