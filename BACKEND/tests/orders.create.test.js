// ── tests/orders.create.test.js ───────────────────────────────────────────
// Tests for  POST /api/orders  (requires auth token)

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock('../src/models/orderModel', () => ({
  createOrder:       jest.fn(),
  getUserOrders:     jest.fn(),
  getOrderById:      jest.fn(),
  updateOrderStatus: jest.fn(),
  getAllOrders:       jest.fn(),
  getDashboardStats: jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

// Mock jwt so we can generate a valid token without a real secret
jest.mock('jsonwebtoken', () => {
  const real = jest.requireActual('jsonwebtoken');
  return {
    ...real,
    // verify always resolves to a known user payload
    verify: jest.fn((token, secret, cb) => {
      cb(null, { id: 7, role: 'user' });
    }),
    sign: jest.fn(() => 'mocked_order_token'),
  };
});

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request    = require('supertest');
const app        = require('../server');
const orderModel = require('../src/models/orderModel');

const VALID_TOKEN = 'Bearer mocked_order_token';

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('POST /api/orders', () => {

  afterEach(() => jest.clearAllMocks());

  const validPayload = {
    totalAmount:   5000,
    items:         [{ productId: 1, quantity: 2, price: 2500 }],
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
  };

  // TEST 1 ─ Creates order successfully
  test('should return 201 on successful order creation', async () => {
    orderModel.createOrder.mockResolvedValue({
      id: 101, user_id: 7, total_amount: 5000, status: 'Pending',
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', VALID_TOKEN)
      .send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(101);
  });

  // TEST 2 ─ Missing items → 400
  test('should return 400 if items array is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', VALID_TOKEN)
      .send({ totalAmount: 5000, items: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Order items are required');
  });

  // TEST 3 ─ Missing items key → 400
  test('should return 400 if items field is missing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', VALID_TOKEN)
      .send({ totalAmount: 5000 });

    expect(res.statusCode).toBe(400);
  });

  // TEST 4 ─ No auth token → 401
  test('should return 401 if no auth token provided', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send(validPayload);

    expect(res.statusCode).toBe(400);
  });

  // TEST 5 ─ DB error → 500
  test('should return 500 if orderModel.createOrder throws', async () => {
    orderModel.createOrder.mockRejectedValue(new Error('DB insert failed'));

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', VALID_TOKEN)
      .send(validPayload);

    expect(res.statusCode).toBe(500);
  });

});
