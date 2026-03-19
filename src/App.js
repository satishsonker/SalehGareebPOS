import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Dashboard from './pages/admin/Dashboard';
import MasterData from './pages/admin/MasterData';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import ComponentsExample from './pages/admin/ComponentsExample';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            {/* Login Route - Public */}
            <Route path="/login" element={<Login />} />

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
              <Route path="master-data" element={<MasterData />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="settings" element={<Settings />} />
              <Route path="components-example" element={<ComponentsExample />} />
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
