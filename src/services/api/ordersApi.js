import { get, post, put, del } from '../../utils/api';

// Search / list orders
export const searchOrders = (params) => {
  const query = new URLSearchParams(params).toString();
  return get(`/orders/search?${query}`);
};

export const getOrders = (pageNo = 1, pageSize = 20) =>
  get(`/orders?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getOrderById = (id) => get(`/orders/${id}`);

export const createOrder = (data) => post('/orders', data);

export const updateOrder = (id, data) => put(`/orders/${id}`, data);

export const cancelOrder = (id) => put(`/orders/${id}/cancel`);

export const deleteOrder = (id) => del(`/orders/${id}`);
