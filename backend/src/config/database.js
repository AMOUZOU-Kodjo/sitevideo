const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: false
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
