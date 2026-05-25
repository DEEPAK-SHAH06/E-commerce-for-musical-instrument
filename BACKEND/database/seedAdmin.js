// BACKEND/database/seedAdmin.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  const email = 'admin@musicstore.com';
  const password = 'adminpassword123';
  const name = 'System Administrator';
  const role = 'admin';

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkRes = await pool.query(checkQuery, [email]);

    if (checkRes.rowCount > 0) {
      console.log('Admin already exists.');
    } else {
      const insertQuery = 'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)';
      await pool.query(insertQuery, [email, hash, name, role]);
      console.log('Admin user created successfully!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
