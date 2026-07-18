// ── tests/auth.register.test.js ────────────────────────────────────────────
// Tests for  POST /api/auth/register

// ── Step 1: Mock all external dependencies BEFORE importing the app ─────────
jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_jwt_token'),
}));

// Mock the DB so the app never tries a real connection at import time
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

// ── Step 2: Import AFTER mocks ───────────────────────────────────────────────
const request       = require('supertest');
const app           = require('../server');
const userModel     = require('../src/models/userModel');

// ── Step 3: Test suite ────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Successful registration
  test('should return 201 and token on successful registration', async () => {
    userModel.findUserByEmail.mockResolvedValue(null); // user does not exist yet
    userModel.createUser.mockResolvedValue({
      id: 1, email: 'john@example.com', name: 'John', role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token', 'mock_jwt_token');
    expect(res.body.user).toMatchObject({ email: 'john@example.com', role: 'user' });
  });

  // TEST 2 ─ Email already exists → 409
  test('should return 409 if user already exists', async () => {
    userModel.findUserByEmail.mockResolvedValue({ id: 1, email: 'john@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('User already exists');
  });

  // TEST 3 ─ DB error on findUserByEmail → 500
  test('should return 500 on database error', async () => {
    userModel.findUserByEmail.mockRejectedValue(new Error('DB crashed'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(500);
  });

  // TEST 4 ─ DB error on createUser → 500
  test('should return 500 if createUser fails', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);
    userModel.createUser.mockRejectedValue(new Error('Insert failed'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(500);
  });

  // TEST 5 ─ Response body contains correct user structure
  test('should return user object without password in response', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);
    userModel.createUser.mockResolvedValue({
      id: 42, email: 'alice@example.com', name: 'Alice', role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'pass456' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(res.body.user.id).toBe(42);
  });

});
