import { get, post, put, del } from '../../utils/api';

const notificationRequestOptions = { skipLoader: true };

export const getSystemNotifications = (pageNo = 1, pageSize = 10) =>
  get(`/systemnotifications?pageNo=${pageNo}&pageSize=${pageSize}`, notificationRequestOptions);

export const getSystemNotificationById = (id) =>
  get(`/systemnotifications/${id}`, notificationRequestOptions);

export const createSystemNotification = (data) =>
  post('/systemnotifications', data, notificationRequestOptions);

export const updateSystemNotification = (id, data) =>
  put(`/systemnotifications/${id}`, data, notificationRequestOptions);

export const deleteSystemNotification = (id) =>
  del(`/systemnotifications/${id}`, notificationRequestOptions);

export const sendSystemNotification = (id) =>
  post(`/systemnotifications/${id}/send`, undefined, notificationRequestOptions);

// Returns notifications that are currently active and within schedule window
export const getActiveSystemNotifications = () =>
  get('/systemnotifications/active', notificationRequestOptions);
