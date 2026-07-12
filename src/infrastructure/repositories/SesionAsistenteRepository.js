const pool = require('../database/db');

class SesionAsistenteRepository {
  async findActiva(pacienteId) {
    const { rows } = await pool.query(
      'SELECT * FROM sesiones_asistente WHERE paciente_id = $1 AND activa = TRUE',
      [pacienteId]
    );
    return rows[0] ?? null;
  }

  async crear(pacienteId) {
    const { rows } = await pool.query(
      'INSERT INTO sesiones_asistente (paciente_id) VALUES ($1) RETURNING *',
      [pacienteId]
    );
    return rows[0];
  }

  async actualizarResumen(id, resumen) {
    await pool.query(
      'UPDATE sesiones_asistente SET resumen = $1, updated_at = NOW() WHERE id = $2',
      [resumen, id]
    );
  }

  async cerrar(id) {
    await pool.query(
      'UPDATE sesiones_asistente SET activa = FALSE, updated_at = NOW() WHERE id = $1',
      [id]
    );
  }
}

module.exports = SesionAsistenteRepository;
