// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Spin, Carousel, Space } from 'antd';
import { Link } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data.slice(0, 8)); // Show top 8 categories
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <Carousel autoplay className="hero-carousel" style={{ marginBottom: 60, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="hero-overlay">
            <Title level={1} style={{ color: '#fff', fontSize: '48px', marginBottom: '16px' }}>Master Your Craft</Title>
            <Text style={{ color: '#fff', fontSize: '20px', marginBottom: '32px', maxWidth: '600px', textAlign: 'center' }}>
              Explore our curated collection of professional-grade musical instruments.
            </Text>
            <Button type="primary" size="large" style={{ height: '48px', padding: '0 32px', fontSize: '18px' }}>
              <Link to="/products">Shop Collections</Link>
            </Button>
          </div>
        </div>
      </Carousel>

      {/* Categories Grid */}
      <Title level={2} className="section-title">Explore Categories</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 60 }}>
        {categories.map((cat) => (
          <Col xs={24} sm={12} md={6} key={cat.name}>
            <Link to={`/products?categoryName=${cat.name}`}>
              <Card
                hoverable
                className="product-card"
                cover={<img alt={cat.name} src={cat.image} style={{ height: 220, objectFit: 'cover' }} />}
                style={{ textAlign: 'center' }}
              >
                <Card.Meta title={<Text strong style={{ fontSize: '18px' }}>{cat.name}</Text>} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Featured Products */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Title level={2} style={{ margin: 0 }}>Featured Arrivals</Title>
        <Button type="link" size="large"><Link to="/products">View All Products →</Link></Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" tip="Tuning instruments..." /></div>
      ) : (
        <Row gutter={[24, 24]} style={{ marginBottom: 60 }}>
          {products.map((product) => (
            <Col xs={24} sm={12} md={6} key={product.id}>
              <Card
                hoverable
                className="product-card"
                cover={<img alt={product.name} src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ height: 200, objectFit: 'cover' }} />}
                actions={[
                  <Link to={`/products/${product.id}`} key="view">Details</Link>,
                  <Text key="price" strong style={{ color: '#f5222d' }}>${product.price}</Text>
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={<Text type="secondary">{product.brand}</Text>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default HomePage;
