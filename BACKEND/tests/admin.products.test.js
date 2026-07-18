// ── tests/admin.products.test.js ──────────────────────────────────────────
// Tests for admin product management:
//   POST   /api/admin/products
//   PUT    /api/admin/products/:id
//   DELETE /api/admin/products/:id

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock('../src/models/productModel', () => ({
  getProducts:    jest.fn(),
  getProductById: jest.fn(),
  createProduct:  jest.fn(),
  updateProduct:  jest.fn(),
  deleteProduct:  jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('../src/models/orderModel', () => ({
  getAllOrders:       jest.fn(),
  getDashboardStats: jest.fn(),
  getOrderById:      jest.fn(),
  updateOrderStatus: jest.fn(),
}));

jest.mock('../src/models/categoryModel', () => ({
  getCategories:   jest.fn(),
  getCategoryById: jest.fn(),
  createCategory:  jest.fn(),
  updateCategory:  jest.fn(),
  deleteCategory:  jest.fn(),
}));

// JWT verify always resolves to an admin user
jest.mock('jsonwebtoken', () => {
  const real = jest.requireActual('jsonwebtoken');
  return {
    ...real,
    verify: jest.fn((token, secret, cb) => {
      cb(null, { id: 1, role: 'admin' });
    }),
    sign: jest.fn(() => 'admin_prod_token'),
  };
});

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request      = require('supertest');
const app          = require('../server');
const productModel = require('../src/models/productModel');

const ADMIN_AUTH = 'Bearer admin_prod_token';

const sampleProduct = {
  name: 'Electric Guitar', description: 'Stratocaster', price: 35000,
  stock: 10, image_url: null, category_id: 1, brand: 'Fender', specs: {},
};

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('Admin – Product Management', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Create product (admin only)
  test('POST /api/admin/products → 201 on success', async () => {
    productModel.createProduct.mockResolvedValue({ id: 10, ...sampleProduct });

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', ADMIN_AUTH)
      .send(sampleProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(10);
    expect(res.body.name).toBe('Electric Guitar');
  });

  // TEST 2 ─ Create product without auth → 401
  test('POST /api/admin/products → 401 without token', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send(sampleProduct);

    expect(res.statusCode).toBe(401);
  });

  // TEST 3 ─ Update product
  test('PUT /api/admin/products/:id → 200 on success', async () => {
    productModel.updateProduct.mockResolvedValue({ id: 10, ...sampleProduct, price: 30000 });

    const res = await request(app)
      .put('/api/admin/products/10')
      .set('Authorization', ADMIN_AUTH)
      .send({ ...sampleProduct, price: 30000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(30000);
  });

  // TEST 4 ─ Update non-existent product → 404
  test('PUT /api/admin/products/:id → 404 when product missing', async () => {
    productModel.updateProduct.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/admin/products/9999')
      .set('Authorization', ADMIN_AUTH)
      .send(sampleProduct);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  // TEST 5 ─ Delete product
  test('DELETE /api/admin/products/:id → 200 on success', async () => {
    productModel.deleteProduct.mockResolvedValue({ id: 10 });

    const res = await request(app)
      .delete('/api/admin/products/10')
      .set('Authorization', ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Product deleted successfully');
  });

  // TEST 6 ─ Delete non-existent product → 404
  test('DELETE /api/admin/products/:id → 404 when product missing', async () => {
    productModel.deleteProduct.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/admin/products/9999')
      .set('Authorization', ADMIN_AUTH);

    expect(res.statusCode).toBe(404);
  });

});
