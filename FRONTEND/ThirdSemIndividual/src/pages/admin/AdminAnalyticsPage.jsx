// src/pages/admin/AdminAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, message, DatePicker, Space } from 'antd';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import adminService from '../../api/adminService';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      message.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Detailed Analytics</Title>
        <Space>
          <span>Select Range: </span>
          <RangePicker />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Revenue Growth (Last 30 Days)" bordered={false}>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesByDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Area type="monotone" dataKey="revenue" stroke="#1890ff" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sales by Category" bordered={false}>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Items Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Key Performance Indicators" bordered={false}>
            <div style={{ padding: '20px 0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Typography.Text type="secondary">Avg. Order Value</Typography.Text>
                    <Title level={4}>
                      Rs. {(stats?.summary?.totalRevenue / (stats?.summary?.totalOrders || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Title>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Typography.Text type="secondary">New Customers (This Month)</Typography.Text>
                    <Title level={4}>+{stats?.summary?.newCustomers || 0}</Title>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Typography.Text type="secondary">Total Items Sold</Typography.Text>
                    <Title level={4}>{stats?.summary?.totalItemsSold || 0}</Title>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Typography.Text type="secondary">Cancellation Rate</Typography.Text>
                    <Title level={4}>
                      {stats?.summary?.totalOrders > 0 
                        ? ((stats?.summary?.cancelledOrders / stats?.summary?.totalOrders) * 100).toFixed(1) 
                        : '0.0'}%
                    </Title>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalyticsPage;
