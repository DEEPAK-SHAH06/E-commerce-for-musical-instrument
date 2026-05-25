// src/pages/CartPage.jsx
import React, { useContext, useState } from 'react';
import { Row, Col, Typography, Button, Table, Space, InputNumber, Card, Divider, Empty, message, Tag } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, CreditCardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      message.warning('Please login to continue to checkout');
      navigate('/login');
      return;
    }
    // Simulation of order placement
    setLoading(true);
    setTimeout(() => {
      message.success('Order placed successfully! Thank you for your purchase.');
      clearCart();
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <img src={record.image_url || 'https://via.placeholder.com/50'} alt={text} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
          <Link to={`/products/${record.id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q, record) => (
        <InputNumber min={1} max={99} value={q} onChange={(val) => updateQuantity(record.id, val)} />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `$${(parseFloat(record.price) * record.quantity).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} />
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="Your cart is empty" />
        <Button type="primary" size="large" style={{ marginTop: 24 }}>
          <Link to="/products">Browse Instruments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2}>Shopping Cart</Title>
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Table 
            columns={columns} 
            dataSource={cartItems} 
            rowKey="id" 
            pagination={false} 
            style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}
          />
          <Button icon={<ArrowLeftOutlined />} style={{ marginTop: 24 }}>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Order Summary" style={{ borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>Subtotal ({cartItems.length} items):</Text>
              <Text strong>${cartTotal.toFixed(2)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>Shipping:</Text>
              <Tag color="green">FREE</Tag>
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <Title level={4} style={{ margin: 0 }}>Total:</Title>
              <Title level={4} style={{ margin: 0, color: '#f5222d' }}>${cartTotal.toFixed(2)}</Title>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<CreditCardOutlined />} 
              onClick={handleCheckout}
              loading={loading}
            >
              Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;
