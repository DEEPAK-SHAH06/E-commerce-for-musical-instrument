// src/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Create a new user
async function createUser({ email, password, name, role = 'user' }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const query = `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at`;
  const values = [email, passwordHash, name, role];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// Find user by email
async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1`;
  const { rows } = await db.query(query, [email]);
  return rows[0];
}

// Find user by id
async function findUserById(id) {
  const query = `SELECT id, name, email, role, created_at FROM users WHERE id = $1`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
}

// Get all users
async function getAllUsers() {
  const query = `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
  const { rows } = await db.query(query);
  return rows;
}

// Delete user
async function deleteUser(id) {
  const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  deleteUser,
};
