import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi } from '../services/api/usersApi';

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

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, data: userData };
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

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
