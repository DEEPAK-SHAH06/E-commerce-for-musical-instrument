// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: values.password });
      message.success('Password reset successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
      <Card style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>Reset Password</Title>
          {!submitted ? (
            <>
              <Text type="secondary" style={{ textAlign: 'center', marginBottom: 24, display: 'block' }}>
                Please enter and confirm your new password below.
              </Text>
              <Form name="reset-password" onFinish={onFinish} layout="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="password"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter your new password!' },
                    { min: 6, message: 'Password must be at least 6 characters long!' }
                  ]}
                  hasFeedback
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
                </Form.Item>
                <Form.Item
                  name="confirm"
                  label="Confirm New Password"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your new password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    Reset Password
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Password Updated</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                Your password has been reset successfully. You can now use your new password to log in.
              </Text>
              <Button type="primary" size="large" block>
                <Link to="/login" style={{ color: '#fff' }}>Go to Login</Link>
              </Button>
            </div>
          )}
          {!submitted && (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 16 }}>
              <ArrowLeftOutlined /> Back to Login
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
