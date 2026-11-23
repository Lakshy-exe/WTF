/**
 * Centralised SQL Server connection pool for the SECURE app.
 * Uses the "mssql" package (built on Tedious) to talk to
 * Microsoft SQL Server / SSMS instances.
 */
require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'finsecure_demo',
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  options: {
    encrypt: false,                // set true if connecting to Azure SQL
    trustServerCertificate: true,  // fine for local dev with a self-signed cert
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Lazily-created, reused connection pool (promise-based singleton)
let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        console.log('[secure-app] Connected to SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('[secure-app] DB connection failed:', err.message);
        poolPromise = null; // allow a retry on the next request
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
