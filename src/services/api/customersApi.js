import { get, post, put, del } from '../../utils/api';

const BASE = '/customers';

// ── CRUD ─────────────────────────────────────────────────────────
export const getCustomers    = (pageNo = 1, pageSize = 10) =>
  get(`${BASE}?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getCustomerById = (id) => get(`${BASE}/${id}`);

export const createCustomer  = (data) => post(BASE, data);

export const updateCustomer  = (id, data) => put(`${BASE}/${id}`, data);

export const deleteCustomer  = (id) => del(`${BASE}/${id}`);

// ── Search / Check ────────────────────────────────────────────────
export const searchCustomers = (q, pageNo = 1, pageSize = 10) =>
  get(`${BASE}/search?q=${encodeURIComponent(q)}&pageNo=${pageNo}&pageSize=${pageSize}`);

export const checkCustomerExists = (isdCode, mobile) =>
  get(`${BASE}/check?isdCode=${encodeURIComponent(isdCode)}&mobile=${encodeURIComponent(mobile)}`);

// ── Block / Unblock ───────────────────────────────────────────────
export const blockCustomerByAdmin = (data) =>
  post(`${BASE}/block/by/admin`, data);

export const blockCustomerBySalesman = (data) =>
  post(`${BASE}/block/by/salesman`, data);

export const unblockCustomer = (id, adminId) =>
  post(`${BASE}/${id}/unblock?adminId=${adminId}`, {});

export const getBlockHistory = (id) => get(`${BASE}/${id}/block-history`);

// ── Addresses ─────────────────────────────────────────────────────
export const getCustomerAddresses  = (id) => get(`${BASE}/${id}/addresses`);

export const addCustomerAddress    = (id, data) => post(`${BASE}/${id}/addresses`, data);

export const updateCustomerAddress = (id, addressId, data) =>
  put(`${BASE}/${id}/addresses/${addressId}`, data);

export const deleteCustomerAddress = (id, addressId) =>
  del(`${BASE}/${id}/addresses/${addressId}`);
