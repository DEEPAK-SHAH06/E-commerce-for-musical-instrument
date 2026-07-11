// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: values.email });
      message.success('Password reset link sent successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
      <Card style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>Forgot Password</Title>
          {!submitted ? (
            <>
              <Text type="secondary" style={{ textAlign: 'center', marginBottom: 24, display: 'block' }}>
                Enter the email address associated with your Soundora account. We will send you a secure link to reset your password.
              </Text>
              <Form name="forgot-password" onFinish={onFinish} layout="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter your email address" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    Send Reset Link
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <Title level={4}>Check Your Email</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                We have sent a password reset link to the email address you provided. Please check your inbox and click the link to reset your password.
              </Text>
            </div>
          )}
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 16 }}>
            <ArrowLeftOutlined /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
