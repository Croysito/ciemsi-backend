const IRecetaRepository = require('../../domain/repositories/IRecetaRepository');
const Receta = require('../../domain/entities/Receta');
const pool = require('../database/db');

class RecetaRepository extends IRecetaRepository {
  async findByCita(citaId) {
    const { rows } = await pool.query(
      `SELECT r.id, r.cita_id, r.detalle, r.url_pdf, r.created_at,
              cm.fecha, cm.hora,
              p.id as paciente_id, u.nombre, u.apellido, u.email,
              tel.telefono
       FROM recetas r
       INNER JOIN citas_medicas cm ON r.cita_id = cm.id
       INNER JOIN pacientes p ON cm.paciente_id = p.id
       INNER JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN (
         SELECT usuario_id, telefono FROM pacientes
         INNER JOIN usuarios ON pacientes.usuario_id = usuarios.id
       ) tel ON tel.usuario_id = u.id
       WHERE r.cita_id = $1`,
      [citaId]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async create({ citaId, detalle }) {
    const { rows } = await pool.query(
      `INSERT INTO recetas (cita_id, detalle)
       VALUES ($1, $2) RETURNING id`,
      [citaId, detalle]
    );
    return rows[0].id;
  }

  async updateUrlPdf(id, urlPdf) {
    await pool.query(
      `UPDATE recetas SET url_pdf = $1 WHERE id = $2`,
      [urlPdf, id]
    );
  }

  _mapRow(row) {
    return new Receta({
      id: row.id,
      cita: {
        id: row.cita_id,
        fecha: row.fecha,
        hora: row.hora,
        paciente: {
          id: row.paciente_id,
          nombre: row.nombre,
          apellido: row.apellido,
          email: row.email,
          telefono: row.telefono,
        },
      },
      detalle: row.detalle,
      urlPdf: row.url_pdf,
      createdAt: row.created_at,
    });
  }
}

module.exports = RecetaRepository;