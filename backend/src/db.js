const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const shouldUseSsl =
  process.env.PGSSLMODE === 'require' ||
  process.env.DATABASE_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' && !!connectionString);

const pool = connectionString
  ? new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
  })
  : new Pool({
    host: process.env.PGHOST || process.env.DB_HOST || '127.0.0.1',
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'descubrepy',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
  });

/** Siempre devuelve { rows, rowCount } para evitar "is not iterable" si algo destructure el resultado. */
async function query(text, params) {
  const res = await pool.query(text, params);
  if (res && typeof res === 'object' && 'rows' in res) {
    return { rows: res.rows ?? [], rowCount: res.rowCount ?? (res.rows?.length ?? 0) };
  }
  return { rows: [], rowCount: 0 };
}

module.exports = {
  query,
  end: () => pool.end(),
  pool,
};