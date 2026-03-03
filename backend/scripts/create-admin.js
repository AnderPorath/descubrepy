/**
 * Crea o actualiza el usuario administrador.
 * Ejecutar desde la raíz del backend: node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/db');

const ADMIN = {
  name: 'Ander Porath',
  email: 'anderpthramirez@gmail.com',
  password: '@Ander334',
  role: 'admin',
};

async function main() {
  try {
    const password_hash = await bcrypt.hash(ADMIN.password, 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
      [ADMIN.name, ADMIN.email.toLowerCase(), password_hash, ADMIN.role]
    );
    console.log('Usuario admin creado/actualizado:', ADMIN.email);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
