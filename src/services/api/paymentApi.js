import { get, post, put, del } from '../../utils/api';

export const getpaymentByCustomer = (customerId) =>
  get(`/payment/customer/${customerId}`);

export const getpaymentByOrder = (orderId) =>
  get(`/payment/order/${orderId}`);

export const addPayment = (data) => post('/payment', data);