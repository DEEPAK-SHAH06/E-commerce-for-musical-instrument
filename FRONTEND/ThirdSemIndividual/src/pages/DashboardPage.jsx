// src/pages/DashboardPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Typography, Card, Tabs, Table, Tag, Descriptions, Avatar, Space, Empty } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulation: fetching orders for the user
      // Since we haven't implemented order history backend fully yet, 
      // we'll show a sample or empty state.
      setLoading(false);
    }
  }, [user]);

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (t) => `$${t}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color="blue">{s}</Tag> },
  ];

  if (!user) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Please login to view your dashboard</div>;

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', borderRadius: 8, marginBottom: 24 }}>
            <Avatar size={100} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <Title level={3}>{user.name}</Title>
            <Text type="secondary">{user.email}</Text>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 8 }}>
            <Tabs defaultActiveKey="orders" items={[
              {
                key: 'orders',
                label: (<span><ShoppingOutlined />My Orders</span>),
                children: (
                  orders.length > 0 ? (
                    <Table columns={orderColumns} dataSource={orders} rowKey="id" />
                  ) : (
                    <Empty description="No orders placed yet" />
                  )
                )
              },
              {
                key: 'profile',
                label: (<span><UserOutlined />Profile Settings</span>),
                children: (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Account Type">Customer</Descriptions.Item>
                  </Descriptions>
                )
              }
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Simple Row/Col wrapper for the page layout
const Row = ({ children, gutter }) => <div style={{ display: 'flex', flexWrap: 'wrap', margin: `0 -${gutter/2}px` }}>{children}</div>;
const Col = ({ children, xs, md }) => (
  <div style={{ 
    padding: '0 12px', 
    width: window.innerWidth < 768 ? '100%' : `${(md / 24) * 100}%`,
    boxSizing: 'border-box'
  }}>
    {children}
  </div>
);

export default DashboardPage;
