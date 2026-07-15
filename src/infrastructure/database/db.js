const { Pool } = require('pg');
require('dotenv').config();

// Railway (y la mayoría de hosts en la nube) exponen la base de datos como
// una única cadena DATABASE_URL y requieren SSL. En desarrollo local se sigue
// usando el desglose DB_HOST/DB_PORT/etc. sin SSL.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;