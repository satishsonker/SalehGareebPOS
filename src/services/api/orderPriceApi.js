import { get, post, put, del } from '../../utils/api';

export const getOrderPrices = (pageNo = 1, pageSize = 10) =>
  get(`/orderprices?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getOrderPriceById = (id) => get(`/orderprices/${id}`);

export const createOrderPrice = (data) => post('/orderprices', data);

export const updateOrderPrice = (id, data) => put(`/orderprices/${id}`, data);

export const deleteOrderPrice = (id) => del(`/orderprices/${id}`);
