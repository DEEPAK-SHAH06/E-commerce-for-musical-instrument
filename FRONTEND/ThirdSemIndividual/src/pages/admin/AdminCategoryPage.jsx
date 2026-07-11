// src/pages/admin/AdminCategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import adminService from '../../api/adminService';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminService.getCategories();
      setCategories(response.data);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const response = await adminService.uploadImage(formData);
      form.setFieldsValue({ image_url: response.data.secure_url });
      message.success('Image uploaded successfully to Cloudinary');
      onSuccess(response.data);
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to upload image');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteCategory(id);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, values);
        message.success('Category updated successfully');
      } else {
        await adminService.createCategory(values);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const columns = [
    { 
      title: 'Cover Image', 
      dataIndex: 'image_url', 
      key: 'image_url',
      render: (url) => (
        <img 
          src={url || 'https://via.placeholder.com/80x50?text=No+Image'} 
          alt="Category" 
          style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }} 
        />
      )
    },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="categoryForm" initialValues={{ image_url: '' }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Category Cover Image">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Upload
                customRequest={handleCustomUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} loading={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Cover Image'}
                </Button>
              </Upload>
              <Form.Item name="image_url">
                <Input placeholder="Or paste image URL here" />
              </Form.Item>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoryPage;
