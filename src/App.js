import React,{useEffect} from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import Home from './pages/public/Home';
import About from './pages/public/About';
import CreateOrder from './pages/public/CreateOrder';
import SearchOrders from './pages/public/SearchOrders';
import Customers from './pages/public/Customers';
import CustomersMasterData from './pages/admin/masterData/CustomersMasterData';
import OrderPriceMasterData from './pages/admin/masterData/OrderPriceMasterData';
import Dashboard from './pages/admin/Dashboard';
import SystemData from './pages/admin/SystemData';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import ComponentsExample from './pages/admin/ComponentsExample';
import ShopSelection from './pages/auth/ShopSelection';
import './App.css';

function App() {
  useEffect(() => { 
    if (!localStorage.getItem('device-id')) {
    localStorage.setItem('device-id', crypto.randomUUID());
  }
}, []);
 
  crypto.randomUUID(); // Pre-warm crypto module to avoid delays on first use
  return (
    <ThemeProvider>
      <AuthProvider>
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
              <Route path="orders/create" element={<CreateOrder />} />
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
              <Route path="settings" element={<Settings />} />
              <Route path="components-example" element={<ComponentsExample />} />
              <Route path="customers" element={<CustomersMasterData />} />
              <Route path="order-prices" element={<OrderPriceMasterData />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
