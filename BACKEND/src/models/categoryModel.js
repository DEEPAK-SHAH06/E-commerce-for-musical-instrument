// src/models/categoryModel.js
const db = require('../config/db');

async function getCategories() {
  const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function getCategoryById(id) {
  const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0];
}

async function createCategory({ name, description }) {
  const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
  const values = [name, description];
  const { rows } = await db.query(query, values);
  return rows[0];
}

async function updateCategory(id, { name, description }) {
  const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
  const values = [name, description, id];
  const { rows } = await db.query(query, values);
  return rows[0];
}

async function deleteCategory(id) {
  const { rows } = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  return rows[0];
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
