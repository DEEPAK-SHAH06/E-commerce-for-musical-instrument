// src/pages/PaymentSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Card, Result, Button, Spin, Typography, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, HomeOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const gateway = searchParams.get('gateway');
      
      try {
        let payload = { gateway };

        if (gateway === 'esewa') {
          const data = searchParams.get('data');
          if (!data) {
            throw new Error('eSewa transaction data is missing');
          }
          payload.data = data;
        } 
        else if (gateway === 'khalti') {
          const pidx = searchParams.get('pidx');
          const transaction_id = searchParams.get('transaction_id');
          const purchase_order_id = searchParams.get('purchase_order_id');
          const amount = searchParams.get('amount');
          
          if (!pidx || !purchase_order_id) {
            throw new Error('Khalti transaction details are missing');
          }

          payload.data = {
            pidx,
            transaction_id,
            purchase_order_id,
            amount
          };
        } 
        else {
          throw new Error('Unsupported payment gateway');
        }

        console.log('Sending payment verification request:', payload);
        const response = await api.post('/payment/verify', payload);
        
        if (response.data && response.data.success) {
          setVerified(true);
          setOrderDetails(response.data.order);
        } else {
          throw new Error(response.data?.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setErrorMsg(err.response?.data?.message || err.message || 'Payment verification failed');
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 16 }}>
        <Spin size="large" />
        <Title level={4}>Verifying Payment...</Title>
        <Text type="secondary">Communicating with the payment gateway secure servers. Please do not refresh or close this window.</Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 0' }}>
      <Card style={{ width: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {verified ? (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Payment Successful!"
            subTitle="Your transaction has been securely processed and your order is now being prepared."
            extra={[
              <Button type="primary" key="orders" icon={<ShoppingOutlined />} size="large" onClick={() => navigate('/dashboard')}>
                View My Orders
              </Button>,
              <Button key="home" icon={<HomeOutlined />} size="large" onClick={() => navigate('/')}>
                Back Home
              </Button>,
            ]}
          >
            {orderDetails && (
              <div style={{ marginTop: 24, textAlign: 'left', background: '#fafafa', padding: 20, borderRadius: 8 }}>
                <Title level={5} style={{ marginBottom: 16 }}>Transaction Details</Title>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Order ID">
                    <code>#{orderDetails.id.substring(0, 8).toUpperCase()}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Gateway">
                    <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{orderDetails.payment_method}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Status">
                    <Text type="success" strong>{orderDetails.payment_status}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Order Status">
                    <Text strong type="warning" style={{ textTransform: 'uppercase' }}>{orderDetails.status}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Paid">
                    <Text strong type="danger">Rs. {parseFloat(orderDetails.total_amount).toLocaleString('en-IN')}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Result>
        ) : (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Payment Verification Failed"
            subTitle={errorMsg || "The transaction could not be verified by the gateway."}
            extra={[
              <Button type="primary" key="cart" size="large" onClick={() => navigate('/cart')}>
                Return to Cart
              </Button>,
              <Button key="support" size="large" onClick={() => navigate('/help-support')}>
                Contact Support
              </Button>,
            ]}
          >
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <Text type="secondary">
                If money was deducted from your account, please do not place a new order. Reach out to our support team with your transaction details and order email so we can verify it manually.
              </Text>
            </div>
          </Result>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
