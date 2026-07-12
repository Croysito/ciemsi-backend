const ISaldoInicialRepository = require('../../domain/repositories/ISaldoInicialRepository');
const pool = require('../database/db');

class SaldoInicialRepository extends ISaldoInicialRepository {
  async upsert({ ciudadId, tipo, monto, updatedBy }) {
    const { rows } = await pool.query(
      `INSERT INTO saldo_inicial (ciudad_id, tipo, monto, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (ciudad_id, tipo) DO UPDATE
         SET monto = EXCLUDED.monto,
             updated_by = EXCLUDED.updated_by,
             updated_at = NOW()
       RETURNING *`,
      [ciudadId, tipo, monto, updatedBy || null]
    );
    return rows[0];
  }

  async findByCiudad(ciudadId) {
    const { rows } = await pool.query(
      `SELECT si.tipo,
              COALESCE(si.monto, 0) AS monto,
              si.updated_at
       FROM saldo_inicial si
       WHERE si.ciudad_id = $1`,
      [ciudadId]
    );
    const result = { caja: 0, banco: 0 };
    for (const r of rows) {
      result[r.tipo] = parseFloat(r.monto);
    }
    return result;
  }

  async findAll() {
    const { rows } = await pool.query(
      `SELECT si.ciudad_id, ci.nombre_ciudad, si.tipo,
              COALESCE(si.monto, 0)::float AS monto,
              si.updated_at
       FROM saldo_inicial si
       INNER JOIN ciudades ci ON ci.id = si.ciudad_id
       ORDER BY ci.nombre_ciudad, si.tipo`
    );
    return rows;
  }
}

module.exports = SaldoInicialRepository;
