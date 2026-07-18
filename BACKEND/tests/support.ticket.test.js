// ── tests/support.ticket.test.js ─────────────────────────────────────────
// Tests for  POST /api/support/ticket

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
// Mock the email service that the support controller depends on
jest.mock('../src/services/emailService', () => ({
  sendSupportTicketEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendOrderDeliveredEmail: jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request      = require('supertest');
const app          = require('../server');
const emailService = require('../src/services/emailService');

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('POST /api/support/ticket', () => {

  afterEach(() => jest.clearAllMocks());

  const validTicket = {
    name:    'Jane Doe',
    email:   'jane@example.com',
    subject: 'Order issue',
    message: 'My order has not arrived yet.',
  };

  // TEST 1 ─ Successful ticket submission
  test('should return 200 when ticket is submitted successfully', async () => {
    emailService.sendSupportTicketEmail.mockResolvedValue({ success: true });

    const res = await request(app)
      .post('/api/support/ticket')
      .send(validTicket);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/submitted successfully/i);
  });

  // TEST 2 ─ Missing name → 400
  test('should return 400 if name is missing', async () => {
    const { name, ...partial } = validTicket;

    const res = await request(app)
      .post('/api/support/ticket')
      .send(partial);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  // TEST 3 ─ Missing email → 400
  test('should return 400 if email is missing', async () => {
    const { email, ...partial } = validTicket;

    const res = await request(app)
      .post('/api/support/ticket')
      .send(partial);

    expect(res.statusCode).toBe(400);
  });

  // TEST 4 ─ Missing subject → 400
  test('should return 400 if subject is missing', async () => {
    const { subject, ...partial } = validTicket;

    const res = await request(app)
      .post('/api/support/ticket')
      .send(partial);

    expect(res.statusCode).toBe(400);
  });

  // TEST 5 ─ Missing message → 400
  test('should return 400 if message is missing', async () => {
    const { message, ...partial } = validTicket;

    const res = await request(app)
      .post('/api/support/ticket')
      .send(partial);

    expect(res.statusCode).toBe(400);
  });

  // TEST 6 ─ Email service fails → 500
  test('should return 500 when email service fails', async () => {
    emailService.sendSupportTicketEmail.mockResolvedValue({
      success: false, error: 'SMTP timeout',
    });

    const res = await request(app)
      .post('/api/support/ticket')
      .send(validTicket);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/failed to send/i);
  });

  // TEST 7 ─ Email service throws → 500
  test('should return 500 if email service throws an exception', async () => {
    emailService.sendSupportTicketEmail.mockRejectedValue(new Error('SMTP crashed'));

    const res = await request(app)
      .post('/api/support/ticket')
      .send(validTicket);

    expect(res.statusCode).toBe(501);
  });

});
