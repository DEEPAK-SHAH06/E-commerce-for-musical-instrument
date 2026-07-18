// ── tests/auth.login.test.js ───────────────────────────────────────────────
// Tests for  POST /api/auth/login

// ── Step 1: Mock BEFORE imports ──────────────────────────────────────────────
jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_login_token'),
}));

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────────
const request   = require('supertest');
const app       = require('../server');
const bcrypt    = require('bcrypt');
const userModel = require('../src/models/userModel');

// ── Step 3: Suite ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Successful login
  test('should return 200 with token on valid credentials', async () => {
    const mockUser = {
      id: 1, email: 'john@example.com', name: 'John',
      role: 'user', password_hash: 'hashed_pass',
    };
    userModel.findUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token', 'mock_login_token');
    expect(res.body.user.email).toBe('john@example.com');
  });

  // TEST 2 ─ User not found → 401
  test('should return 401 if user does not exist', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'pass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  // TEST 3 ─ Wrong password → 401
  test('should return 401 on wrong password', async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1, email: 'john@example.com', password_hash: 'hash', role: 'user',
    });
    bcrypt.compare.mockResolvedValue(false);  // password mismatch

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  // TEST 4 ─ DB error → 500
  test('should return 500 on database failure', async () => {
    userModel.findUserByEmail.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(500);
  });

  // TEST 5 ─ bcrypt failure → 500
  test('should return 500 if bcrypt.compare throws', async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1, email: 'john@example.com', password_hash: 'hash', role: 'user',
    });
    bcrypt.compare.mockRejectedValue(new Error('bcrypt crashed'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(500);
  });

});
