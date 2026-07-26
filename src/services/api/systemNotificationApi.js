import { get, post, put, del } from '../../utils/api';

export const getSystemNotifications = (pageNo = 1, pageSize = 10) =>
  get(`/systemnotifications?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getSystemNotificationById = (id) =>
  get(`/systemnotifications/${id}`);

export const createSystemNotification = (data) =>
  post('/systemnotifications', data);

export const updateSystemNotification = (id, data) =>
  put(`/systemnotifications/${id}`, data);

export const deleteSystemNotification = (id) =>
  del(`/systemnotifications/${id}`);

export const sendSystemNotification = (id) =>
  post(`/systemnotifications/${id}/send`);

// Returns notifications that are currently active and within schedule window
export const getActiveSystemNotifications = () =>
  get('/systemnotifications/active');
