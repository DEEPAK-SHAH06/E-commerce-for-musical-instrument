// src/pages/admin/AdminOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Select, message, Descriptions, List, Avatar } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import adminService from '../../api/adminService';

const { Option } = Select;

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getOrders();
      setOrders(response.data);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await adminService.getOrderDetails(id);
      setSelectedOrder(response.data);
      setDetailVisible(true);
    } catch (error) {
      message.error('Failed to fetch order details');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      message.success('Order status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'user_name', key: 'user_name' },
    { title: 'Email', dataIndex: 'user_email', key: 'user_email' },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `Rs. ${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="Pending">Pending</Option>
          <Option value="Processing">Processing</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)}>View</Button>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Order Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="Customer Info" bordered column={2}>
              <Descriptions.Item label="Name">{selectedOrder.user_name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.user_email}</Descriptions.Item>
              <Descriptions.Item label="Order Date">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedOrder.status === 'Delivered' ? 'green' : 'blue'}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 24 }}>Ordered Items</h3>
            <List
              itemLayout="horizontal"
              dataSource={selectedOrder.items}
              renderItem={(item) => (
                <List.Item
                  extra={<div>{item.quantity} x Rs. {parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.image_url} shape="square" size={64} />}
                    title={item.product_name}
                    description={`Price: Rs. ${parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'right', marginTop: 16, fontSize: '18px', fontWeight: 'bold' }}>
              Total: Rs. {parseFloat(selectedOrder.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrderPage;
