// ── tests/categories.test.js ──────────────────────────────────────────────
// Tests for  GET /api/categories  (public)

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock('../src/models/categoryModel', () => ({
  getCategories:   jest.fn(),
  getCategoryById: jest.fn(),
  createCategory:  jest.fn(),
  updateCategory:  jest.fn(),
  deleteCategory:  jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findUserByEmail: jest.fn(),
  createUser:      jest.fn(),
}));

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request       = require('supertest');
const app           = require('../server');
const categoryModel = require('../src/models/categoryModel');

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe('GET /api/categories', () => {

  afterEach(() => jest.clearAllMocks());

  // TEST 1 ─ Returns all categories
  test('should return 200 with list of categories', async () => {
    categoryModel.getCategories.mockResolvedValue([
      { id: 1, name: 'Guitars',     description: 'String instruments' },
      { id: 2, name: 'Percussion',  description: 'Drums and beats' },
      { id: 3, name: 'Keyboards',   description: 'Piano and synths' },
    ]);

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('Guitars');
  });

  // TEST 2 ─ Returns empty array when no categories exist
  test('should return 200 with empty array when no categories', async () => {
    categoryModel.getCategories.mockResolvedValue([]);

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  // TEST 3 ─ DB error → 500
  test('should return 500 when database fails', async () => {
    categoryModel.getCategories.mockRejectedValue(new Error('DB crashed'));

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/server error/i);
  });

  // TEST 4 ─ Response is JSON
  test('should respond with Content-Type json', async () => {
    categoryModel.getCategories.mockResolvedValue([{ id: 1, name: 'Guitars' }]);

    const res = await request(app).get('/api/categories');

    expect(res.headers['content-type']).toMatch(/json/);
  });

  // TEST 5 ─ Each category has id and name fields
  test('each category should have id and name', async () => {
    categoryModel.getCategories.mockResolvedValue([
      { id: 1, name: 'Guitars' },
      { id: 2, name: 'Violins' },
    ]);

    const res = await request(app).get('/api/categories');

    res.body.forEach((cat) => {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
    });
  });

});
