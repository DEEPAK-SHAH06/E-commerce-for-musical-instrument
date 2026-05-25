// src/pages/ProductListPage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Space, Spin, Select, Slider, Empty, Layout } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;
const { Option } = Select;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('newest');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('categoryName'); // Match HeaderBar param name
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products?priceMin=${priceRange[0]}&priceMax=${priceRange[1]}&limit=50&sortBy=${sortBy}`;
        if (category) url += `&categoryName=${category}`;
        if (searchQuery) url += `&search=${searchQuery}`;
        
        const response = await api.get(url);
        // Handle both old format (array) and new format { products: [], total: 0 }
        const productsData = Array.isArray(response.data) ? response.data : response.data.products;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery, priceRange, sortBy]);

  return (
    <Layout style={{ background: '#fff', padding: '24px 0' }}>
      <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: '0 24px' }}>
        <Title level={4}>Filters</Title>
        
        <div style={{ marginBottom: 30 }}>
          <Text strong>Price Range</Text>
          <Slider
            range
            min={0}
            max={5000}
            defaultValue={[0, 5000]}
            onAfterChange={(value) => setPriceRange(value)}
            tipFormatter={(value) => `$${value}`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>${priceRange[0]}</Text>
            <Text>${priceRange[1]}</Text>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <Text strong>Sort By</Text>
          <Select defaultValue="newest" style={{ width: '100%', marginTop: 8 }} onChange={(v) => setSortBy(v)}>
            <Option value="newest">Newest First</Option>
            <Option value="priceLow">Price: Low to High</Option>
            <Option value="priceHigh">Price: High to Low</Option>
          </Select>
        </div>
      </Sider>

      <Content style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            {category ? `${category}` : searchQuery ? `Search: "${searchQuery}"` : 'All Instruments'}
          </Title>
          <Text type="secondary">{products.length} products found</Text>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
        ) : products.length > 0 ? (
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col xs={24} sm={12} lg={8} key={product.id}>
                <Card
                  hoverable
                  cover={<img alt={product.name} src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ height: 200, objectFit: 'cover' }} />}
                  actions={[
                    <Link to={`/products/${product.id}`} key="view">View Details</Link>
                  ]}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{product.brand}</Text>
                        <Text strong style={{ color: '#f5222d', fontSize: 18 }}>${product.price}</Text>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No products found matching your criteria" style={{ marginTop: 100 }} />
        )}
      </Content>
    </Layout>
  );
};

export default ProductListPage;
