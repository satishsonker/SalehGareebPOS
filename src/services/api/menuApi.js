import { get } from '../../utils/api';

/**
 * Menu API Service
 * Handles menu-related operations
 */

// Get accessible menus for the current user
export const getAccessibleMenus = () => {
  return get('/Menu/accessible');
};
