// src/App.jsx
import React from 'react';
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

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '0 50px', marginTop: 84 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </Content>
            <Layout.Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0', padding: '24px 50px' }}>
              MusicStore ©2026 Premium Musical Instruments. All Rights Reserved.
            </Layout.Footer>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  </ConfigProvider>
);

export default App;
