// src/pages/DashboardPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Typography, Card, Tabs, Table, Tag, Descriptions, Avatar, Empty, Space, Button, Popconfirm, message, Row, Col } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../api/api';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const response = await api.get('/orders');
          setOrders(response.data);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      message.success('Order cancelled successfully');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      message.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const orderColumns = [
    { 
      title: 'Order ID', 
      dataIndex: 'id', 
      key: 'id',
      render: (id) => <code>#{id.substring(0, 8).toUpperCase()}</code>
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString()
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total', 
      render: (total) => `${t('currencySymbol')}${parseFloat(total).toLocaleString('en-IN')}`
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (s) => {
        // Map 'Pending' to 'Ordered' (or uppercase) for a more professional look
        const displayStatus = s === 'Pending' ? 'Ordered' : s;
        const colorMap = {
          'Delivered': 'green',
          'Cancelled': 'red',
          'Pending': 'orange',
          'Ordered': 'blue',
          'Processing': 'blue',
          'Shipped': 'cyan'
        };
        return (
          <Tag color={colorMap[displayStatus] || 'blue'}>
            {displayStatus.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, order) => {
        // Use order.date (from get user orders query) or fallback to created_at
        const orderDate = new Date(order.date || order.created_at);
        const now = new Date();
        const diffMinutes = (now - orderDate) / (1000 * 60);
        
        // Cancellable if within 30 mins and not already cancelled or delivered
        const isCancellable = diffMinutes <= 30 && order.status !== 'Cancelled' && order.status !== 'Delivered';

        return isCancellable ? (
          <Popconfirm
            title="Are you sure you want to cancel this order?"
            onConfirm={() => handleCancelOrder(order.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger size="small">Cancel Order</Button>
          </Popconfirm>
        ) : null;
      }
    }
  ];

  const expandedRowRender = (order) => {
    const itemColumns = [
      {
        title: 'Image',
        dataIndex: 'image_url',
        key: 'image_url',
        render: (url, record) => (
          <img src={url || 'https://via.placeholder.com/40'} alt={record.product_name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        )
      },
      {
        title: 'Product Name',
        dataIndex: 'product_name',
        key: 'product_name',
      },
      {
        title: 'Unit Price',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${t('currencySymbol')}${parseFloat(price).toLocaleString('en-IN')}`
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: 'Total',
        key: 'total',
        render: (_, record) => `${t('currencySymbol')}${(parseFloat(record.price) * record.quantity).toLocaleString('en-IN')}`
      }
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={order.items || []}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

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
                label: (<span><ShoppingOutlined />{t('myOrders')}</span>),
                children: (
                  orders.length > 0 ? (
                    <Table 
                      columns={orderColumns} 
                      dataSource={orders} 
                      rowKey="id" 
                      loading={loading} 
                      expandable={{
                        expandedRowRender,
                        defaultExpandAllRows: false
                      }}
                    />
                  ) : (
                    <Empty description={loading ? "Loading..." : "No orders placed yet"} />
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

export default DashboardPage;
