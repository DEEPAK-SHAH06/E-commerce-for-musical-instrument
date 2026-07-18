// ── tests/products.get.test.js ────────────────────────────────────────────
// Tests for  GET /api/products  and  GET /api/products/:id

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

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request      = require('supertest');
const app          = require('../server');
const productModel = require('../src/models/productModel');

// ── Step 3: Test suites ───────────────────────────────────────────────────
describe('GET /api/products', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Returns product list
  test('should return 200 with products array', async () => {
    productModel.getProducts.mockResolvedValue({
      products: [
        { id: 1, name: 'Guitar', price: 4999 },
        { id: 2, name: 'Violin', price: 8999 },
      ],
      total: 2,
    });

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  // TEST 2 ─ Returns empty list when no products
  test('should return 200 with empty array when no products', async () => {
    productModel.getProducts.mockResolvedValue({ products: [], total: 0 });

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  // TEST 3 ─ DB error → 500
  test('should return 500 on database failure', async () => {
    productModel.getProducts.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/server error/i);
  });

});

describe('GET /api/products/:id', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 4 ─ Found product by ID
  test('should return 200 with the product when found', async () => {
    productModel.getProductById.mockResolvedValue({ id: 5, name: 'Drum Kit', price: 25000 });

    const res = await request(app).get('/api/products/5');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Drum Kit');
  });

  // TEST 5 ─ Product not found → 404
  test('should return 404 when product does not exist', async () => {
    productModel.getProductById.mockResolvedValue(null);

    const res = await request(app).get('/api/products/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not fouund');
  });

  // TEST 6 ─ DB error → 500
  test('should return 500 if getProductById throws', async () => {
    productModel.getProductById.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/products/1');

    expect(res.statusCode).toBe(500);
  });

});
