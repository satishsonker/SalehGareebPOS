import { get, put, del } from '../../utils/api';

// Get all notifications for a user (paginated)
export const getUserNotifications = (userId, pageNo = 1, pageSize = 50) =>
  get(`/AppNotifications/user/${userId}?pageNo=${pageNo}&pageSize=${pageSize}`);

// Get unread notification count  →  ApiResponse<int>  (response.data = number)
export const getUnreadCount = (userId) =>
  get(`/AppNotifications/user/${userId}/unread-count`);

// Mark a single notification as read  →  ApiResponse<bool>
export const markNotificationRead = (id) =>
  put(`/AppNotifications/${id}/read`);

// Mark all notifications as read for a user  →  ApiResponse<bool>
export const markAllNotificationsRead = (userId) =>
  put(`/AppNotifications/user/${userId}/read-all`);

// Hard-delete a notification  →  ApiResponse<bool>
export const deleteNotification = (id) =>
  del(`/AppNotifications/${id}`);

// Get activity log for a specific user (paginated)
export const getUserActivities = (userId, pageNo = 1, pageSize = 50) =>
  get(`/AppNotifications/activities/user/${userId}?pageNo=${pageNo}&pageSize=${pageSize}`);

// Get all activities — admin only (paginated)
export const getAllActivities = (pageNo = 1, pageSize = 50) =>
  get(`/AppNotifications/activities?pageNo=${pageNo}&pageSize=${pageSize}`);
