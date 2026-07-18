// ── tests/auth.forgotPassword.test.js ────────────────────────────────────
// Tests for  POST /api/auth/forgot-password
//        and POST /api/auth/reset-password

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock('../src/models/userModel', () => ({
  findUserByEmail:      jest.fn(),
  setResetToken:        jest.fn(),
  findUserByResetToken: jest.fn(),
  updateUserPassword:   jest.fn(),
  createUser:           jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail:  jest.fn(),
  sendSupportTicketEmail:  jest.fn(),
  sendOrderDeliveredEmail: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_jwt'),
}));

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request      = require('supertest');
const app          = require('../server');
const userModel    = require('../src/models/userModel');
const emailService = require('../src/services/emailService');

// ── Step 3: Suite — forgot-password ───────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Sends reset link when email exists
  test('should return 200 and send email when user exists', async () => {
    userModel.findUserByEmail.mockResolvedValue({ id: 1, email: 'john@example.com', name: 'John' });
    userModel.setResetToken.mockResolvedValue({});
    emailService.sendPasswordResetEmail.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/sent/i);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  // TEST 2 ─ User not found → 404
  test('should return 404 if email is not registered', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/does not exist/i);
  });

  // TEST 3 ─ DB error → 500
  test('should return 500 if DB throws during lookup', async () => {
    userModel.findUserByEmail.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@example.com' });

    expect(res.statusCode).toBe(500);
  });

  // TEST 4 ─ setResetToken DB error → 500
  test('should return 500 if setResetToken fails', async () => {
    userModel.findUserByEmail.mockResolvedValue({ id: 1, email: 'john@example.com', name: 'John' });
    userModel.setResetToken.mockRejectedValue(new Error('Token save failed'));

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@example.com' });

    expect(res.statusCode).toBe(500);
  });

});

// ── Suite — reset-password ────────────────────────────────────────────────
describe('POST /api/auth/reset-password', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 5 ─ Successfully resets password
  test('should return 200 on valid reset token', async () => {
    userModel.findUserByResetToken.mockResolvedValue({ id: 1, email: 'john@example.com' });
    userModel.updateUserPassword.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken123', password: 'newpassword' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);
    expect(userModel.updateUserPassword).toHaveBeenCalledWith(1, 'newpassword');
  });

  // TEST 6 ─ Invalid or expired token → 400
  test('should return 400 for invalid or expired token', async () => {
    userModel.findUserByResetToken.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'expiredtoken', password: 'newpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  // TEST 7 ─ DB error on updateUserPassword → 500
  test('should return 500 if updateUserPassword fails', async () => {
    userModel.findUserByResetToken.mockResolvedValue({ id: 1 });
    userModel.updateUserPassword.mockRejectedValue(new Error('Update failed'));

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken', password: 'newpass' });

    expect(res.statusCode).toBe(500);
  });

});
