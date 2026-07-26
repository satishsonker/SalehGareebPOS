import { get, post } from '../../utils/api';

// List all registered cache refresh actions
export const getCacheActions = () => get('/cache/actions');

// Trigger a specific cache refresh action by its key
export const triggerCache = (key) => post(`/cache/trigger?key=${encodeURIComponent(key)}`);

// Trigger all cache refresh actions
export const triggerAllCache = () => post('/cache/trigger-all');

// Trigger all cache refresh actions belonging to a group
export const triggerCacheByGroup = (group) => post(`/cache/trigger-group?group=${encodeURIComponent(group)}`);
