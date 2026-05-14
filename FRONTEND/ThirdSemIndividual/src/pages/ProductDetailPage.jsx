// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Typography, Button, Space, InputNumber, Divider, Card, Tag, message, Breadcrumb } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../api/api';
import { CartContext } from '../context/CartContext';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        message.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Space size="large" />Loading...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Product not found</div>;

  return (
    <div style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/products">Products</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[48, 48]}>
        <Col xs={24} md={12}>
          <img 
            src={product.image_url || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
          />
        </Col>
        <Col xs={24} md={12}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Tag color="blue">{product.brand}</Tag>
            <Title level={1} style={{ marginTop: 8 }}>{product.name}</Title>
            <Text strong style={{ fontSize: 28, color: '#f5222d' }}>${product.price}</Text>
            
            <Divider />
            
            <Title level={4}>Description</Title>
            <Paragraph style={{ fontSize: 16 }}>{product.description}</Paragraph>

            <Divider />

            <Space size="large" align="center">
              <InputNumber min={1} max={99} defaultValue={1} value={quantity} onChange={setQuantity} size="large" />
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />} 
                onClick={() => {
                  addToCart(product, quantity);
                  message.success('Added to cart!');
                }}
              >
                Add to Cart
              </Button>
            </Space>

            <Divider />

            {product.specs && (
              <>
                <Title level={4}>Specifications</Title>
                <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <Row key={key} style={{ marginBottom: 8 }}>
                      <Col span={8}><Text strong style={{ textTransform: 'capitalize' }}>{key}:</Text></Col>
                      <Col span={16}><Text>{value}</Text></Col>
                    </Row>
                  ))}
                </div>
              </>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
