// BACKEND/database/testConnection.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('--- Database Connection Test ---');
console.log('Target URL:', process.env.DATABASE_URL ? 'URL is set' : 'URL is MISSING');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const start = Date.now();
    const res = await pool.query('SELECT NOW() as now, current_user as user, current_database() as db');
    const duration = Date.now() - start;
    
    console.log('✅ Connection Successful!');
    console.log('Time:', res.rows[0].now);
    console.log('Connected as:', res.rows[0].user);
    console.log('Database:', res.rows[0].db);
    console.log('Latency:', duration + 'ms');
  } catch (err) {
    console.error('❌ Connection Failed!');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    
    if (err.code === '28P01') {
      console.log('\n💡 HINT: Incorrect password. Check your .env file.');
    } else if (err.code === '28000') {
      console.log('\n💡 HINT: User does not exist.');
    } else if (err.code === '3D000') {
      console.log('\n💡 HINT: Database does not exist.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 HINT: PostgreSQL server is not running or port is wrong.');
    }
  } finally {
    await pool.end();
  }
}

testConnection();
