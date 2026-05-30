const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isSSL = connectionString && (connectionString.includes('sslmode=require') || connectionString.includes('sslmode=verify-full') || process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString,
  ssl: isSSL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
