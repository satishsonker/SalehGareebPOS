import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginApi,
  logout as logoutApi,
  resendOtp as resendOtpApi,
  validateOtp as validateOtpApi,
  forgotPassword as forgotPasswordApi,
  forgotUsername as forgotUsernameApi,
} from '../services/api/authApi';

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const selectedShopData = localStorage.getItem('selectedShop');
    if (token) {
      try {
        const parsedUser = getUserData(token);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if (selectedShopData) {
          setSelectedShop(JSON.parse(selectedShopData));
        }

      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    sessionStorage.removeItem('sessionId');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('selectedShop');
    sessionStorage.removeItem('selectedShop');
    setUser(null);
    setIsAuthenticated(false);
    setSelectedShop(null);
  };

  const validateOtp = async ({ otp, sessionId }) => {
    const response = await validateOtpApi({ otp, sessionId });
    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      const userData = localStorage.getItem('user');

      // Store token and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', JSON.stringify(refreshToken));

      if (userData && accessToken) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: 'User session not found. Please login again.' };
    }

    return {
      success: false,
      message: response.message || 'OTP validation failed',
      errors: response.errors || []
    };
  };

  const resendOtp = async (sessionId) => {
    return await resendOtpApi({ sessionId });
  };

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);

      if (response.success && response.data) {
        const { sessionId } = response.data;

        // Store token and user data
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true, data: response.data };
      } else {
        // Handle API response with success: false
        return {
          success: false,
          message: response.message || 'Login failed',
          errors: response.errors || []
        };
      }
    } catch (error) {
      console.error('Login error:', error);

      // Extract error message from error object
      // The API utility already extracts the message from the response
      // and sets it as error.message, with error.response containing the full response
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.message && !error.message.startsWith('API Error:')) {
        // Use the extracted message from API utility
        errorMessage = error.message;
      } else if (error.response) {
        // Fallback to response object if message wasn't extracted
        if (error.response.message) {
          errorMessage = error.response.message;
        } else if (error.response.errors && Array.isArray(error.response.errors)) {
          errorMessage = error.response.errors.join(', ');
        }
      } else if (error.message) {
        // Last resort: use error message as-is
        errorMessage = error.message;
      }
      if (errorMessage === "Failed to fetch") {
        errorMessage = "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      if (errorMessage && errorMessage.startsWith('A connection was successfully established with the server, but then an error occurred during the pre-login handshake.')) {
        // Use the extracted message from API utility
        errorMessage = 'Unable to connect with database';
      }
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.errors || []
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const forgetPassword = async (username) => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const getUserData = (token) => {
    if (token) {
      var userDataTemp = jwtDecode(token);
      var userData = {
        userId: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        email: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        firstName: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
        lastName: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
        phone: userDataTemp["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"],
        role: userDataTemp["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      };
      return userData;
    }
    return null;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    validateOtp,
    resendOtp,
    logout,
    clearAuth,
    selectedShop,
    setSelectedShop,
    getUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
