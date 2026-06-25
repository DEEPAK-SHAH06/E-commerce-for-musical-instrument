// src/pages/CartPage.jsx
import React, { useContext, useState } from 'react';
import { Row, Col, Typography, Button, Table, Space, InputNumber, Card, Divider, Empty, message, Tag, Modal, Radio } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, CreditCardOutlined, WalletOutlined, BankOutlined, DollarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../api/api';

const { Title, Text } = Typography;

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      message.warning(t('pleaseLoginCheckout'));
      navigate('/login');
      return;
    }
    setPaymentModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        totalAmount: cartTotal,
        status: 'Pending',
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      };

      await api.post('/orders', orderData);
      
      message.success(t('orderPlacedSuccess'));
      clearCart();
      setPaymentModalVisible(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout failed:', error);
      message.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t('product'),
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
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q, record) => (
        <InputNumber min={1} max={99} value={q} onChange={(val) => updateQuantity(record.id, val)} />
      ),
    },
    {
      title: t('total'),
      key: 'total',
      render: (_, record) => `$${(parseFloat(record.price) * record.quantity).toFixed(2)}`,
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} />
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description={t('emptyCart')} />
        <Button type="primary" size="large" style={{ marginTop: 24 }}>
          <Link to="/products">{t('browseInstruments')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2}>{t('shoppingCart')}</Title>
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
            <Link to="/products">{t('continueShopping')}</Link>
          </Button>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('orderSummary')} style={{ borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>{t('subtotal')} ({cartItems.length} items):</Text>
              <Text strong>${cartTotal.toFixed(2)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>{t('shipping')}:</Text>
              <Tag color="green">{t('free')}</Tag>
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <Title level={4} style={{ margin: 0 }}>{t('total')}:</Title>
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
              {t('checkout')}
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Payment Selection Modal */}
      <Modal
        title={<div style={{ fontSize: '18px', fontWeight: 'bold' }}><CreditCardOutlined style={{ color: '#1890ff', marginRight: 8 }} /> {t('selectPaymentMethod')}</div>}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={handleConfirmOrder}
        confirmLoading={loading}
        okText={t('payPlaceOrder')}
        cancelText="Cancel"
        width={550}
        bodyStyle={{ padding: '16px 0' }}
      >
        <div style={{ padding: '0 24px 16px 24px' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {t('paymentDescription')}
          </Text>
        </div>
        
        <Radio.Group 
          onChange={(e) => setSelectedPayment(e.target.value)} 
          value={selectedPayment} 
          style={{ width: '100%', padding: '0 24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {/* eSewa */}
            <Radio.Button value="esewa" style={{ width: '100%', height: 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <WalletOutlined style={{ fontSize: '24px', color: '#4caf50', marginRight: 16 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{t('esewa')}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Pay instantly using your eSewa credentials</Text>
                </div>
              </div>
            </Radio.Button>

            {/* Khalti */}
            <Radio.Button value="khalti" style={{ width: '100%', height: 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <WalletOutlined style={{ fontSize: '24px', color: '#5c258d', marginRight: 16 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{t('khalti')}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Pay instantly using your Khalti credentials</Text>
                </div>
              </div>
            </Radio.Button>

            {/* COD */}
            <Radio.Button value="cod" style={{ width: '100%', height: 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <DollarOutlined style={{ fontSize: '24px', color: '#ff9800', marginRight: 16 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{t('cashOnDelivery')}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Pay with cash upon physical delivery of your instruments</Text>
                </div>
              </div>
            </Radio.Button>

            {/* Bank Transfer */}
            <Radio.Button value="bank" style={{ width: '100%', height: 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <BankOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 16 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{t('bankTransfer')}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Transfer directly to our corporate bank account</Text>
                </div>
              </div>
            </Radio.Button>
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default CartPage;
