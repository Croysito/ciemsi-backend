const IDeudaRepository = require('../../domain/repositories/IDeudaRepository');
const Deuda = require('../../domain/entities/Deuda');
const pool = require('../database/db');

class DeudaRepository extends IDeudaRepository {
  async create({ pacienteId, tratamientoAsignadoId, montoOriginal, montoPendiente, estado, fechaLimite }) {
    const { rows } = await pool.query(
      `INSERT INTO deudas (paciente_id, tratamiento_asignado_id, monto_original, monto_pendiente, estado, fecha_limite)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [pacienteId, tratamientoAsignadoId, montoOriginal, montoPendiente, estado || 'pendiente', fechaLimite || null]
    );
    return rows[0].id;
  }

  async findById(id) {
    const { rows } = await pool.query(this._baseQuery('WHERE d.id = $1'), [id]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByTratamientoAsignado(tratamientoAsignadoId) {
    const { rows } = await pool.query(
      this._baseQuery('WHERE d.tratamiento_asignado_id = $1'),
      [tratamientoAsignadoId]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByPaciente(pacienteId) {
    const { rows } = await pool.query(
      this._baseQuery('WHERE d.paciente_id = $1 ORDER BY d.created_at DESC'),
      [pacienteId]
    );
    return rows.map(r => this._mapRow(r));
  }

  async resumenPendientesPorPaciente() {
    const { rows } = await pool.query(
      `SELECT paciente_id, SUM(monto_pendiente)::float AS total_pendiente
       FROM deudas
       WHERE estado = 'pendiente'
       GROUP BY paciente_id`
    );
    return rows.map(r => ({
      pacienteId: r.paciente_id,
      totalPendiente: parseFloat(r.total_pendiente),
    }));
  }

  async updateMontoPendiente(id, montoPendiente, estado) {
    await pool.query(
      `UPDATE deudas SET monto_pendiente = $1, estado = $2 WHERE id = $3`,
      [montoPendiente, estado, id]
    );
  }

  _baseQuery(where) {
    return `SELECT d.id, d.monto_original, d.monto_pendiente, d.estado, d.fecha_limite, d.created_at,
                   p.id AS paciente_id, up.nombre AS paciente_nombre, up.apellido AS paciente_apellido,
                   ta.id AS ta_id, t.nombre_tratamiento AS ta_nombre, ta.precio AS ta_precio
            FROM deudas d
            INNER JOIN pacientes p ON p.id = d.paciente_id
            INNER JOIN usuarios up ON up.id = p.usuario_id
            INNER JOIN tratamiento_asignado ta ON ta.id = d.tratamiento_asignado_id
            INNER JOIN tratamientos t ON t.id = ta.tratamiento_id
            ${where}`;
  }

  _mapRow(row) {
    return new Deuda({
      id: row.id,
      paciente: { id: row.paciente_id, nombre: row.paciente_nombre, apellido: row.paciente_apellido },
      tratamientoAsignado: { id: row.ta_id, nombre: row.ta_nombre, precio: parseFloat(row.ta_precio) },
      montoOriginal: parseFloat(row.monto_original),
      montoPendiente: parseFloat(row.monto_pendiente),
      estado: row.estado,
      fechaLimite: row.fecha_limite,
      createdAt: row.created_at,
    });
  }
}

module.exports = DeudaRepository;
