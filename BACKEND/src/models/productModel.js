// src/models/productModel.js
const db = require('../config/db');

// Get list of products with optional filters and pagination
async function getProducts({ page = 1, limit = 12, brand, priceMin, priceMax, instrumentType, categoryId, categoryName, search, sortBy = 'newest' }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (brand) { conditions.push(`p.brand = $${idx++}`); values.push(brand); }
  if (priceMin !== undefined) { conditions.push(`p.price >= $${idx++}`); values.push(priceMin); }
  if (priceMax !== undefined) { conditions.push(`p.price <= $${idx++}`); values.push(priceMax); }
  if (instrumentType) { conditions.push(`p.specs->>'instrumentType' = $${idx++}`); values.push(instrumentType); }
  if (categoryId) { conditions.push(`p.category_id = $${idx++}`); values.push(categoryId); }
  if (categoryName) { conditions.push(`c.name ILIKE $${idx++}`); values.push(`%${categoryName}%`); }
  
  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx++})`);
    values.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const joinClause = 'LEFT JOIN categories c ON p.category_id = c.id';

  let orderClause = 'ORDER BY p.created_at DESC';
  if (sortBy === 'priceLow') orderClause = 'ORDER BY p.price ASC';
  if (sortBy === 'priceHigh') orderClause = 'ORDER BY p.price DESC';
  if (sortBy === 'oldest') orderClause = 'ORDER BY p.created_at ASC';

  const countQuery = `SELECT COUNT(*) FROM products p ${joinClause} ${whereClause}`;
  const totalCount = await db.query(countQuery, values);

  const query = `
    SELECT p.*, c.name as category_name
    FROM products p 
    ${joinClause}
    ${whereClause} 
    ${orderClause}
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(limit, offset);

  const { rows } = await db.query(query, values);
  return { products: rows, total: parseInt(totalCount.rows[0].count) };
}

// Get a single product by id
async function getProductById(id) {
  const { rows } = await db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1', [id]);
  return rows[0];
}

// Create a new product
async function createProduct({ name, description, price, stock, image_url, category_id, brand, specs }) {
  const query = `INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
  const values = [name, description, price, stock, image_url, category_id, brand, specs];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// Update product
async function updateProduct(id, { name, description, price, stock, image_url, category_id, brand, specs }) {
  const query = `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, category_id = $6, brand = $7, specs = $8
                 WHERE id = $9 RETURNING *`;
  const values = [name, description, price, stock, image_url, category_id, brand, specs, id];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// Delete product
async function deleteProduct(id) {
  const { rows } = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return rows[0];
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
