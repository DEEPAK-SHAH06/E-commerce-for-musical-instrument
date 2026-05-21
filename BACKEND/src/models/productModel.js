// src/models/productModel.js
const db = require('../config/db');

// Get list of products with optional filters and pagination
async function getProducts({ page = 1, limit = 12, brand, priceMin, priceMax, instrumentType, categoryId, categoryName, search }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (brand) { conditions.push(`brand = $${idx++}`); values.push(brand); }
  if (priceMin !== undefined) { conditions.push(`price >= $${idx++}`); values.push(priceMin); }
  if (priceMax !== undefined) { conditions.push(`price <= $${idx++}`); values.push(priceMax); }
  if (instrumentType) { conditions.push(`specs->>'instrumentType' = $${idx++}`); values.push(instrumentType); }
  if (categoryId) { conditions.push(`category_id = $${idx++}`); values.push(categoryId); }
  
  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx++})`);
    values.push(`%${search}%`);
  }

  let joinClause = '';
  if (categoryName) {
    conditions.push(`c.name = $${idx++}`);
    values.push(categoryName);
    joinClause = 'JOIN categories c ON p.category_id = c.id';
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT p.* 
    FROM products p 
    ${joinClause} 
    ${whereClause} 
    ORDER BY p.created_at DESC 
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(limit, offset);

  const { rows } = await db.query(query, values);
  return rows;
}

// Get a single product by id
async function getProductById(id) {
  const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0];
}

// Create a new product (protected route)
async function createProduct({ name, description, price, image_url, category_id, brand, specs }) {
  const query = `INSERT INTO products (name, description, price, image_url, category_id, brand, specs)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const values = [name, description, price, image_url, category_id, brand, specs];
  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
