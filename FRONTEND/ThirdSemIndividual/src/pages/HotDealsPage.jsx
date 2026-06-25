// src/pages/HotDealsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Typography, Statistic, Tag, message, Spin } from 'antd';
import { ThunderboltOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const HotDealsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { t } = useContext(LanguageContext);

  // Set deal countdown for the next 12 hours
  const [deadline] = useState(Date.now() + 1000 * 60 * 60 * 12);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // Fetch products to show as hot deals
      const response = await api.get('/products');
      // Take a few products to represent deals
      const dealProducts = (response.data.products || response.data || []).slice(0, 8).map((p, index) => {
        // Dynamically assign a discount percentage between 15% and 30%
        const discounts = [15, 20, 25, 30];
        const discount = discounts[index % discounts.length];
        const originalPrice = parseFloat(p.price);
        const dealPrice = originalPrice * (1 - discount / 100);
        return {
          ...p,
          discount,
          originalPrice,
          price: dealPrice, // overwrite price for cart addition
        };
      });
      setProducts(dealProducts);
    } catch (error) {
      console.error('Error fetching deals:', error);
      message.error('Failed to load hot deals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    message.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        marginBottom: 32,
        backgroundColor: '#fff3e0',
        padding: '20px 30px',
        borderRadius: 8,
        borderLeft: '5px solid #ff9800'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ThunderboltOutlined style={{ fontSize: '32px', color: '#ff9800', marginRight: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>{t('hotDealsTitle')}</Title>
            <Text type="secondary">{t('nepalStore')}</Text>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: window.innerWidth < 576 ? 16 : 0 }}>
          <Text strong style={{ marginRight: 12, fontSize: 16 }}>{t('dealTimer')}</Text>
          <Countdown value={deadline} format="HH:mm:ss" valueStyle={{ color: '#f5222d', fontWeight: 'bold' }} />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              cover={
                <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f5f5f5' }}>
                  <img
                    alt={product.name}
                    src={product.image_url || 'https://via.placeholder.com/300'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Tag color="red" style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', fontSize: 14, fontWeight: 'bold' }}>
                    {product.discount}% {t('offPercent')}
                  </Tag>
                </div>
              }
            >
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{product.brand || 'Premium Brand'}</Text>
                <Title level={4} style={{ margin: '4px 0 12px 0', fontSize: 16, height: 44, overflow: 'hidden' }}>
                  <Link to={`/products/${product.id}`} style={{ color: 'inherit' }}>{product.name}</Link>
                </Title>
                <div style={{ marginBottom: 16 }}>
                  <Text delete style={{ marginRight: 8, color: '#999', fontSize: 14 }}>
                    ${product.originalPrice.toFixed(2)}
                  </Text>
                  <Text type="danger" strong style={{ fontSize: 20 }}>
                    ${product.price.toFixed(2)}
                  </Text>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => handleAddToCart(product)}
                  style={{ flex: 1 }}
                >
                  {t('addToCart')}
                </Button>
                <Button style={{ flex: 1 }}>
                  <Link to={`/products/${product.id}`}>{t('viewDetails')}</Link>
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HotDealsPage;
