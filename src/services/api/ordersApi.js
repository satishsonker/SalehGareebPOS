import { apiRequest, get, post, put, del } from '../../utils/api';

// Search / list orders
export const searchOrders = (params) => {
  const query = new URLSearchParams(params).toString();
  return get(`/orders/search?${query}`);
};

export const getOrders = (pageNo = 1, pageSize = 20, searchTerm = "", searchBy = "all") => {
  const params = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize), searchTerm, searchBy });
  return get(`/orders?${params.toString()}`);
};

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

export const getMeasurementByOrderId = (orderId) => get(`/orders/suborder/${orderId}`);

export const createOrder = (data) => post('/orders', data);

export const updateOrder = (id, data) => put(`/orders/${id}`, data);

export const cancelOrder = (id) => put(`/orders/${id}/cancel`);

export const cancelOrderItem = (itemId, data) => post(`/orders/items/${itemId}/cancel`, data);

export const deleteOrder = (id) => del(`/orders/${id}`);

// Payments / Ledger
export const getOrderPayments = (orderId) => get(`/orders/${orderId}/ledger`);
export const addOrderAdvance = (orderId, advance) => post(`/orders/${orderId}/advance`, advance);
export const addOrderPayment = (orderId, payment) => post(`/orders/${orderId}/payment`, payment);

// Measurements (per itemId)
export const updateItemMeasurement = (itemId, measurement) => put('/orders/suborder/measurements', [{
  ...(measurement || {}),
  orderDetailId: itemId,
  notes: measurement?.notes || measurement?.note || ''
}]);

export const uploadSubOrderImage = (itemId, file, imageType = 'model') => {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest(`/orders/suborder/${itemId}/image?imageType=${encodeURIComponent(imageType)}`, { method: 'POST', body: formData });
};

export const getCustomerMeasurements = (customerId) => get(`/orders/customers/${customerId}/measurements`);

// Item status and work type updates (per itemId)
export const updateItemStatus = (itemId, statusPayload) => put(`/orders/items/${itemId}/status`, statusPayload);

export const updateSubOrderWorkTypes = (itemId, workTypes) => put(`/orders/suborder/${itemId}/work-types`, workTypes);
