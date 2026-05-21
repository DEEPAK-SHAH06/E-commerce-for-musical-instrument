// src/models/categoryModel.js
const db = require('../config/db');

async function getCategories() {
  const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function createCategory({ name, parent_id }) {
  const query = 'INSERT INTO categories (name, parent_id) VALUES ($1, $2) RETURNING *';
  const values = [name, parent_id];
  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  getCategories,
  createCategory,
};
