// ── tests/orders.cancel.test.js ───────────────────────────────────────────
// Tests for  PUT /api/orders/:id/cancel  (requires auth token)

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock('../src/models/orderModel', () => ({
  getOrderById:      jest.fn(),
  updateOrderStatus: jest.fn(),
  createOrder:       jest.fn(),
  getUserOrders:     jest.fn(),
  getAllOrders:       jest.fn(),
  getDashboardStats: jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('jsonwebtoken', () => {
  const real = jest.requireActual('jsonwebtoken');
  return {
    ...real,
    verify: jest.fn((token, secret, cb) => {
      cb(null, { id: 7, role: 'user' });
    }),
    sign: jest.fn(() => 'mocked_cancel_token'),
  };
});

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request    = require('supertest');
const app        = require('../server');
const orderModel = require('../src/models/orderModel');

const AUTH = 'Bearer mocked_cancel_token';

// ── Helpers ───────────────────────────────────────────────────────────────
const recentDate = () => new Date(Date.now() - 5 * 60 * 1000).toISOString();  // 5 min ago
const oldDate    = () => new Date(Date.now() - 40 * 60 * 1000).toISOString(); // 40 min ago

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('PUT /api/orders/:id/cancel', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Successfully cancel a recent order
  test('should return 200 when cancelling a valid recent order', async () => {
    orderModel.getOrderById.mockResolvedValue({
      id: 1, user_id: 7, status: 'Pending', created_at: recentDate(),
    });
    orderModel.updateOrderStatus.mockResolvedValue({
      id: 1, status: 'Cancelled',
    });

    const res = await request(app)
      .put('/api/orders/1/cancel')
      .set('Authorization', AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Cancelled');
  });

  // TEST 2 ─ Order not found → 404
  test('should return 404 if order does not exist', async () => {
    orderModel.getOrderById.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/orders/999/cancel')
      .set('Authorization', AUTH);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Order not found');
  });

  // TEST 3 ─ Order belongs to another user → 403
  test('should return 403 if order belongs to a different user', async () => {
    orderModel.getOrderById.mockResolvedValue({
      id: 2, user_id: 99, status: 'Pending', created_at: recentDate(),
    });

    const res = await request(app)
      .put('/api/orders/2/cancel')
      .set('Authorization', AUTH);

    expect(res.statusCode).toBe(402);
    expect(res.body.message).toBe('Forbidden');
  });

  // TEST 4 ─ Order placed > 30 min ago → 400
  test('should return 400 if cancellation window has passed', async () => {
    orderModel.getOrderById.mockResolvedValue({
      id: 3, user_id: 7, status: 'Pending', created_at: oldDate(),
    });

    const res = await request(app)
      .put('/api/orders/3/cancel')
      .set('Authorization', AUTH);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/30 minutes/i);
  });

  // TEST 5 ─ Already cancelled order → 400
  test('should return 400 if order is already cancelled', async () => {
    orderModel.getOrderById.mockResolvedValue({
      id: 4, user_id: 7, status: 'Cancelled', created_at: recentDate(),
    });

    const res = await request(app)
      .put('/api/orders/4/cancel')
      .set('Authorization', AUTH);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Cancelled/);
  });

  // TEST 6 ─ No token → 401
  test('should return 401 when no auth token is provided', async () => {
    const res = await request(app).put('/api/orders/1/cancel');
    expect(res.statusCode).toBe(401);
  });

});
