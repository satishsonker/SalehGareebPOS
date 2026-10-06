import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ApiLoaderProvider } from './contexts/ApiLoaderContext';
import { NotificationProvider } from './components/Notification';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import GlobalLoader from './components/Loader/GlobalLoader';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import Home from './pages/public/Home';
import About from './pages/public/About';
import NewOrderPage from './pages/public/Order/NewOrderPage';
import SearchOrders from './pages/public/SearchOrders';
import Customers from './pages/public/Customer/Customers';
import CustomersMasterData from './pages/admin/masterData/CustomersMasterData';
import OrderPriceMasterData from './pages/admin/masterData/OrderPriceMasterData';
import SystemNotifications from './pages/admin/SystemNotifications';
import CacheManagement from './pages/admin/CacheManagement';
import DesignModels from './pages/admin/DesignModels';
import Dashboard from './pages/admin/Dashboard';
import SystemData from './pages/admin/SystemData';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import AdminSettings from './pages/admin/AdminSettings';
import ComponentsExample from './pages/admin/ComponentsExample';
import ShopSelection from './pages/auth/ShopSelection';
import {
    KeyboardProvider,
    VirtualKeyboard
} from "./components/VirtualKeyboard/index";
import './App.css';

function App() {
  const generateUUID = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20,12)}`;
      }
    } catch (e) {
      console.warn('crypto unavailable or failed, falling back to Math.random for UUID', e);
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    if (!localStorage.getItem('device-id')) {
      localStorage.setItem('device-id', generateUUID());
    }
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ApiLoaderProvider>
            <KeyboardProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Login Route - Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/otp/verify" element={<OtpVerification />} />
                    <Route path="/shop/selection" element={<ShopSelection />} />

                    {/* Public Routes - Protected */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <PublicLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Home />} />
                      <Route path="about" element={<About />} />
                      <Route path="orders/create" element={<NewOrderPage />} />
                      <Route path="orders/search" element={<SearchOrders />} />
                      <Route path="customers" element={<Customers />} />
                    </Route>

                    {/* Admin Routes - Protected with Admin Check */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="system-data" element={<SystemData />} />
                      <Route path="products" element={<Products />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="components-example" element={<ComponentsExample />} />
                      <Route path="customers" element={<CustomersMasterData />} />
                      <Route path="order-prices" element={<OrderPriceMasterData />} />
                      <Route path="notifications" element={<SystemNotifications />} />
                      <Route path="cache" element={<CacheManagement />} />
                      <Route path="design-models" element={<DesignModels />} />
                    </Route>

                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
              <GlobalLoader />
              <VirtualKeyboard />
            </KeyboardProvider>
          </ApiLoaderProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
