const pool = require('../database/db');

class TraspasoRepository {
  async registrar({ ciudadId, tipo, monto, descripcion, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO traspasos_cuenta (ciudad_id, tipo, monto, descripcion, usuario_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ciudadId, tipo, monto, descripcion || null, usuarioId]
    );
    return rows[0];
  }

  async eliminar(id) {
    await pool.query('DELETE FROM traspasos_cuenta WHERE id = $1', [id]);
  }
}

module.exports = TraspasoRepository;
