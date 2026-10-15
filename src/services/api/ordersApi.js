import { get, post, put, del } from '../../utils/api';

// Search / list orders
export const searchOrders = (params) => {
  const query = new URLSearchParams(params).toString();
  return get(`/orders/search?${query}`);
};

export const getOrders = (pageNo = 1, pageSize = 20, searchTerm = "") =>
  get(`/orders?pageNo=${pageNo}&pageSize=${pageSize}&searchTerm=${searchTerm}`);

export const getOrderAlerts = (filters = {}) => {
  const params = new URLSearchParams();
  params.set('AlertBeforeDays', String(filters.alertBeforeDays ?? 10));
  if (filters.salesmanId) params.set('SalesmanId', String(filters.salesmanId));
  if (filters.orderType) params.set('OrderType', filters.orderType);
  if (filters.fromDate) params.set('FromDate', filters.fromDate);
  if (filters.toDate) params.set('ToDate', filters.toDate);
  params.set('PageNo', String(filters.pageNo ?? 1));
  params.set('PageSize', String(filters.pageSize ?? 20));
  return get(`/orders/order-alert?${params.toString()}`);
};

export const getOrderById = (id) => get(`/orders/${id}`);

export const createOrder = (data) => post('/orders', data);

export const updateOrder = (id, data) => put(`/orders/${id}`, data);

export const cancelOrder = (id) => put(`/orders/${id}/cancel`);

export const cancelOrderItem = (itemId, data) => post(`/orders/items/${itemId}/cancel`, data);

export const deleteOrder = (id) => del(`/orders/${id}`);

// Payments / Ledger
export const getOrderPayments = (orderId) => get(`/orders/${orderId}/ledger`);
export const addOrderAdvance = (orderId, advance) => post(`/orders/${orderId}/advance`, advance);

// Measurements (per itemId)
export const updateItemMeasurement = (itemId, measurement) => {
  const payload = {
    measurementsJson: JSON.stringify(measurement || {}),
    notes: (measurement && (measurement.notes || measurement.note)) || ''
  };
  return put(`/orders/items/${itemId}/measurements`, payload);
};

// Item status and work type updates (per itemId)
export const updateItemStatus = (itemId, statusPayload) => put(`/orders/items/${itemId}/status`, statusPayload);
