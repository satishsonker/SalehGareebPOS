import {post} from '../../utils/api';

// Login user
export const login = (data) => {
  return post('/auth/login', data);
};

// Logout user
export const logout = () => {
  return post('/auth/logout');
};

// Change password
export const changePassword = (data) => {
  return post('/auth/change/password', data);
};

// Forgot password
export const forgotPassword = (data) => {
  return post('/auth/forget/password', data);
};

// Forgot username
export const forgotUsername = (data) => {
  return post('/auth/forget/username', data);
};

export const resetPassword = (data) => post('/auth/forget/reset', data);

export const validateOtp = (data) => {
  return post('/auth/otp/validate', data);
};

export const resendOtp = (data) => {
  return post('/auth/otp/resend', data);
};

