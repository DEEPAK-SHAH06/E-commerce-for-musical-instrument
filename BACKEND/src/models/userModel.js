// src/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Create a new user
async function createUser({ email, password, name }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const query = `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at`;
  const values = [email, passwordHash, name];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// Find user by email
async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1`;
  const { rows } = await db.query(query, [email]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
};
