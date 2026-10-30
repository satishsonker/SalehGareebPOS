import { get, put, apiRequest } from '../../utils/api';

// Get all settings (returns flat list; each item has displayName, dataType, group, etc.)
export const getAdminSettings = () => get('/adminsettings?pageNo=1&pageSize=100');

// Get settings grouped by category
export const getAdminSettingGroups = () => get('/adminsettings/groups');

// Update a single setting value by id
export const updateAdminSetting = (id, data) => apiRequest(`/adminsettings/${id}/value`, { method: 'PATCH', body: JSON.stringify(data) });

// Bulk update multiple settings at once
export const bulkUpdateAdminSettings = (data) => put('/adminsettings/bulk', data);

export const getOrderProcessingSettingsByShop = () => get('/adminsettings/order-processing');
export const updateOrderProcessingSettingsByShop = (data) => put('/adminsettings/order-processing', data);
