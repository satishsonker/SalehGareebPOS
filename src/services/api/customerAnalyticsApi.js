import { get, post } from '../../utils/api';

export const getCustomerAnalytics = params => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null));
  return get(`/customer-analytics?${query.toString()}`);
};
export const recalculateCustomerAnalytics = () => post('/customer-analytics/recalculate', {});
