// src/components/HeaderBar.jsx
import React, { useContext, useState } from 'react';
import { Layout, Menu, Input, Badge, Dropdown, Space, Typography, Button, Drawer } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  SearchOutlined, 
  MenuOutlined, 
  GlobalOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

const HeaderBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, cartTotal } = useContext(CartContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();

  const userMenuItems = [
    { key: 'orders', label: <Link to="/dashboard">{t('myOrders')}</Link> },
    { key: 'profile', label: <Link to="/dashboard?tab=profile">{t('accountSettings')}</Link> },
    { type: 'divider' },
    { key: 'logout', label: <span onClick={() => { logout(); navigate('/'); }}>{t('signOut')}</span> },
  ];

  const mainCategories = [
    { key: 'electric-guitars', label: 'Electric Guitars', path: '/products?categoryName=Electric Guitars' },
    { key: 'acoustic-guitars', label: 'Acoustic Guitars', path: '/products?categoryName=Acoustic Guitars' },
    { key: 'bass-guitars', label: 'Bass Guitars', path: '/products?categoryName=Bass Guitars' },
    { key: 'pianos', label: 'Digital Pianos', path: '/products?categoryName=Digital Pianos' },
    { key: 'synthesizers', label: 'Synthesizers', path: '/products?categoryName=Synthesizers' },
    { key: 'drums', label: 'Drum Kits', path: '/products?categoryName=Drum Kits' },
    { key: 'cymbals', label: 'Cymbals', path: '/products?categoryName=Cymbals' },
    { key: 'violins', label: 'Violins', path: '/products?categoryName=Violins' },
  ];

  return (
    <div style={{ position: 'sticky', zIndex: 1000, width: '100%', top: 0 }}>
      {/* Top Utility Bar */}
      <div style={{ 
        height: '32px', 
        backgroundColor: '#001529', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        padding: '0 50px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Space size={24} style={{ fontSize: '12px' }}>
          <Link to="/hot-deals" style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThunderboltOutlined /> {t('hotDeals')}
          </Link>
          <Link to="/help-support" style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <QuestionCircleOutlined /> {t('helpSupport')}
          </Link>
          <Dropdown
            menu={{
              items: [
                { key: 'en', label: 'English', onClick: () => setLanguage('en') },
                { key: 'ne', label: 'नेपाली (Nepali)', onClick: () => setLanguage('ne') }
              ]
            }}
            placement="bottomRight"
          >
            <span style={{ color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GlobalOutlined /> {language === 'en' ? 'English' : 'नेपाली'}
            </span>
          </Dropdown>
        </Space>
      </div>

      {/* Main Header */}
      <Header style={{ 
        height: '72px', 
        padding: '0 50px', 
        backgroundColor: '#001529', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: 'none'
      }}>
        <div className="logo" style={{ marginRight: '40px', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
           
            <div style={{ backgroundColor: '#1890ff', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '20px', marginRight: '8px' }}>S</div>
            <Text strong style={{ fontSize: '22px', color: '#fff', letterSpacing: '-0.5px' }}>SOUNDORA</Text>
          </Link>
        </div>

        <div style={{ flex: 1, maxWidth: '800px' }}>
          <Search
            placeholder={t('searchPlaceholder')}
            onSearch={(value) => navigate(`/products?search=${value}`)}
            size="large"
            enterButton
            style={{ borderRadius: '6px', overflow: 'hidden' }}
          />
        </div>

        <Space size={32} style={{ marginLeft: '40px' }}>
          <Dropdown menu={{ items: user ? userMenuItems : [] }} placement="bottomRight" disabled={!user}>
            <div 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}
              onClick={() => !user && navigate('/login')}
            >
              <UserOutlined style={{ fontSize: '22px' }} />
              <Text style={{ color: '#fff', fontSize: '11px', marginTop: '2px' }}>{user ? t('account') : t('signIn')}</Text>
            </div>
          </Dropdown>

          <Link to="/cart">
            <div style={{ display: 'flex', alignItems: 'center', color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px' }}>
              <Badge count={cartCount} showZero offset={[5, -5]} color="#1890ff">
                <ShoppingCartOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </Badge>
              <div style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column' }}>
                <Text style={{ color: '#aaa', fontSize: '10px', lineHeight: 1 }}>{t('cart')}</Text>
                <Text style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{t('currencySymbol')}{cartTotal.toFixed(2)}</Text>
              </div>
            </div>
          </Link>
        </Space>
      </Header>

      {/* Category Navigation Bar */}
      <div style={{ 
        height: '44px', 
        backgroundColor: '#fff', 
        padding: '0 50px', 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: '1px solid #e8e8e8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          style={{ marginRight: '16px', fontWeight: 'bold' }}
          onClick={() => setMobileMenuVisible(true)}
        >
          {t('categories')}
        </Button>

        <Menu
          mode="horizontal"
          style={{ flex: 1, border: 'none', height: '43px', lineHeight: '43px' }}
          items={mainCategories.map(cat => ({
            key: cat.key,
            label: <Link to={cat.path} style={{ fontWeight: 500 }}>{cat.label}</Link>
          }))}
        />
      </div>

      <Drawer
        title={t('categories')}
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
      >
        <Menu
          mode="vertical"
          items={mainCategories.map(cat => ({
            key: cat.key,
            label: <Link to={cat.path} onClick={() => setMobileMenuVisible(false)}>{cat.label}</Link>
          }))}
        />
      </Drawer>
    </div>
  );
};

export default HeaderBar;
