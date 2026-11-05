import { del, get, post, put } from '../../utils/api';

const BASE = '/customer-policies';
export const getCustomerPolicy = id => get(`${BASE}/customer/${id}`);
export const requestCustomerBlock = data => post(`${BASE}/block-requests`, data);
export const requestCustomerUnblock = data => post(`${BASE}/unblock-requests`, data);
export const getCustomerPolicyRequests = status => get(`${BASE}/admin/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const approveCustomerPolicyRequest = (type, id) => post(`${BASE}/admin/requests/${type}/${id}/approve`, {});
export const rejectCustomerPolicyRequest = (type, id, reason) => post(`${BASE}/admin/requests/${type}/${id}/reject`, { reason });
export const getCustomerPolicyAlerts = () => get(`${BASE}/admin/alerts`);
export const createCustomerAlert = data => post(`${BASE}/alerts`, data);
export const updateCustomerAlert = (id, data) => put(`${BASE}/alerts/${id}`, data);
export const deactivateCustomerAlert = id => del(`${BASE}/alerts/${id}`);
