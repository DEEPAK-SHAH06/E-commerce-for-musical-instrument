require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSqlScript() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../convert_prices_to_rupees.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('Executing SQL script...');
    const result = await pool.query(sql);
    console.log('✅ SQL script executed successfully!');
    console.log(result);
  } catch (err) {
    console.error('❌ Error executing SQL script:', err);
  } finally {
    await pool.end();
  }
}

runSqlScript();