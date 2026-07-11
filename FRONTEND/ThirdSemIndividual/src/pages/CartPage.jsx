// src/pages/CartPage.jsx
import React, { useContext, useState } from 'react';
import { Row, Col, Typography, Button, Table, Space, InputNumber, Card, Divider, Empty, message, Tag, Modal, Radio } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, CreditCardOutlined, WalletOutlined, BankOutlined, DollarOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.checkout === true && user && cartItems.length > 0) {
      setPaymentModalVisible(true);
      // Clear location state to prevent modal reopening on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, cartItems, navigate, location.pathname]);

  const handleCheckout = () => {
    if (!user) {
      message.warning(t('pleaseLoginCheckout'));
      navigate('/login');
      return;
    }
    setPaymentModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      message.warning('Please select a payment method first.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order in the database
      const orderData = {
        totalAmount: cartTotal,
        status: 'Pending',
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cod' || selectedPayment === 'bank' ? 'PENDING' : 'UNPAID',
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      };

      const orderRes = await api.post('/orders', orderData);
      const createdOrder = orderRes.data;

      // 2. Process based on selected payment gateway
      if (selectedPayment === 'esewa') {
        message.info('Redirecting to eSewa payment gateway...');
        const initRes = await api.post('/payment/esewa/initiate', { orderId: createdOrder.id });
        
        // Dynamically create and submit eSewa ePays v2 form
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', initRes.data.payment_url);
        
        Object.entries(initRes.data.params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', key);
          input.setAttribute('value', value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        clearCart();
        form.submit();
      } 
      else if (selectedPayment === 'khalti') {
        message.info('Redirecting to Khalti payment gateway...');
        const initRes = await api.post('/payment/khalti/initiate', { orderId: createdOrder.id });
        clearCart();
        window.location.href = initRes.data.payment_url;
      } 
      else {
        // Cash on Delivery or Bank Transfer
        if (selectedPayment === 'cod') {
          message.success('Order placed! Please pay ' + t('currencySymbol') + cartTotal.toLocaleString('en-IN') + ' in cash upon delivery.');
        } else {
          message.success('Order placed! Direct Bank Transfer details will be sent to your email.');
        }
        clearCart();
        setPaymentModalVisible(false);
        navigate('/dashboard');
      }
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
        
        <div style={{ width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* eSewa */}
          <div 
            onClick={() => setSelectedPayment('esewa')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              borderRadius: '10px', 
              border: selectedPayment === 'esewa' ? '2px solid #52c41a' : '1px solid #e8e8e8', 
              cursor: 'pointer',
              backgroundColor: selectedPayment === 'esewa' ? '#f6ffed' : '#fafafa',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <Radio checked={selectedPayment === 'esewa'} style={{ marginRight: 16, pointerEvents: 'none' }} />
            <WalletOutlined style={{ fontSize: '28px', color: '#52c41a', marginRight: 16 }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#262626', fontSize: '15px' }}>{t('esewa')}</div>
              <Text type="secondary" style={{ fontSize: '13px' }}>Pay instantly using eSewa Mobile Wallet (Test Mode)</Text>
            </div>
          </div>

          {/* Khalti */}
          <div 
            onClick={() => setSelectedPayment('khalti')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              borderRadius: '10px', 
              border: selectedPayment === 'khalti' ? '2px solid #722ed1' : '1px solid #e8e8e8', 
              cursor: 'pointer',
              backgroundColor: selectedPayment === 'khalti' ? '#f9f0ff' : '#fafafa',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <Radio checked={selectedPayment === 'khalti'} style={{ marginRight: 16, pointerEvents: 'none' }} />
            <WalletOutlined style={{ fontSize: '28px', color: '#722ed1', marginRight: 16 }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#262626', fontSize: '15px' }}>{t('khalti')}</div>
              <Text type="secondary" style={{ fontSize: '13px' }}>Pay instantly using Khalti Digital Wallet (Test Mode)</Text>
            </div>
          </div>

          {/* COD */}
          <div 
            onClick={() => setSelectedPayment('cod')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              borderRadius: '10px', 
              border: selectedPayment === 'cod' ? '2px solid #fa8c16' : '1px solid #e8e8e8', 
              cursor: 'pointer',
              backgroundColor: selectedPayment === 'cod' ? '#fff7e6' : '#fafafa',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <Radio checked={selectedPayment === 'cod'} style={{ marginRight: 16, pointerEvents: 'none' }} />
            <DollarOutlined style={{ fontSize: '28px', color: '#fa8c16', marginRight: 16 }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#262626', fontSize: '15px' }}>{t('cashOnDelivery')}</div>
              <Text type="secondary" style={{ fontSize: '13px' }}>Pay with cash upon physical delivery of your instruments</Text>
            </div>
          </div>

          {/* Bank Transfer */}
          <div 
            onClick={() => setSelectedPayment('bank')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              borderRadius: '10px', 
              border: selectedPayment === 'bank' ? '2px solid #1890ff' : '1px solid #e8e8e8', 
              cursor: 'pointer',
              backgroundColor: selectedPayment === 'bank' ? '#e6f7ff' : '#fafafa',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <Radio checked={selectedPayment === 'bank'} style={{ marginRight: 16, pointerEvents: 'none' }} />
            <BankOutlined style={{ fontSize: '28px', color: '#1890ff', marginRight: 16 }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#262626', fontSize: '15px' }}>{t('bankTransfer')}</div>
              <Text type="secondary" style={{ fontSize: '13px' }}>Transfer directly to our corporate bank account</Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;
