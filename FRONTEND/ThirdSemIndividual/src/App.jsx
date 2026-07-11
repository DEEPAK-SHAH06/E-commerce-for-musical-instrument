// src/App.jsx
//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import HeaderBar from './components/HeaderBar';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductPage from './pages/admin/AdminProductPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import HotDealsPage from './pages/HotDealsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import './App.css';

const { Content } = Layout;

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
      components: {
        Layout: {
          headerBg: '#ffffff',
          bodyBg: '#f5f7fa',
        },
      },
    }}
  >
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductPage />} />
                  <Route path="categories" element={<AdminCategoryPage />} />
                  <Route path="orders" element={<AdminOrderPage />} />
                  <Route path="users" element={<AdminUserPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>

              {/* Public Routes */}
              <Route
                path="*"
                element={
                  <Layout style={{ minHeight: '100vh' }}>
                    <HeaderBar />
                    <Content style={{ padding: '0 50px' }}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/payment-success" element={<PaymentSuccessPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/hot-deals" element={<HotDealsPage />} />
                        <Route path="/help-support" element={<HelpSupportPage />} />
                      </Routes>
                    </Content>
                    <Layout.Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0', padding: '24px 50px' }}>
                      MusicStore ©2026 Premium Musical Instruments. All Rights Reserved.
                    </Layout.Footer>
                  </Layout>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </ConfigProvider>
);

export default App;
