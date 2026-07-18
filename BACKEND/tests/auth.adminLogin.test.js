// ── tests/auth.adminLogin.test.js ─────────────────────────────────────────
// Tests for  POST /api/auth/admin/login

// ── Step 1: Mocks BEFORE imports ──────────────────────────────────────────
jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'admin_jwt_token'),
}));

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ────────────────────────────────────────────────────────
const request   = require('supertest');
const app       = require('../server');
const bcrypt    = require('bcrypt');
const userModel = require('../src/models/userModel');

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('POST /api/auth/admin/login', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Admin logs in successfully
  test('should return 200 and token for valid admin credentials', async () => {
    const adminUser = {
      id: 99, email: 'admin@example.com', name: 'Admin',
      role: 'admin', password_hash: 'admin_hash',
    };
    userModel.findUserByEmail.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'adminpass' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token', 'admin_jwt_token');
    expect(res.body.user.role).toBe('admin');
  });

  // TEST 2 ─ Non-admin user tries admin login → 401
  test('should return 401 if user is not admin', async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1, email: 'user@example.com', role: 'user', password_hash: 'hash',
    });

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'user@example.com', password: 'pass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/access denied/i);
  });

  // TEST 3 ─ User not found → 401
  test('should return 401 if email not found', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'ghost@example.com', password: 'pass' });

    expect(res.statusCode).toBe(401);
  });

  // TEST 4 ─ Wrong password for admin → 401
  test('should return 401 if admin password is wrong', async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 99, email: 'admin@example.com', role: 'admin', password_hash: 'hash',
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });

  // TEST 5 ─ DB error → 500
  test('should return 500 on server error', async () => {
    userModel.findUserByEmail.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'adminpass' });

    expect(res.statusCode).toBe(500);
  });

});
