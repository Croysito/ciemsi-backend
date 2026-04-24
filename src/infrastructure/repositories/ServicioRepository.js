const IServicioRepository = require('../../domain/repositories/IServicioRepository');
const Servicio = require('../../domain/entities/Servicio');
const pool = require('../database/db');

class ServicioRepository extends IServicioRepository {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre_servicio, tiempo_min, estado FROM servicios ORDER BY nombre_servicio'
    );
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, nombre_servicio, tiempo_min, estado FROM servicios WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async create({ nombreServicio, tiempoMin }) {
    const { rows } = await pool.query(
      `INSERT INTO servicios (nombre_servicio, tiempo_min)
       VALUES ($1, $2) RETURNING id`,
      [nombreServicio, tiempoMin || 30]
    );
    return rows[0].id;
  }

  async update(id, { nombreServicio, tiempoMin, estado }) {
    await pool.query(
      `UPDATE servicios SET nombre_servicio = $1, tiempo_min = $2, estado = $3
       WHERE id = $4`,
      [nombreServicio, tiempoMin, estado, id]
    );
  }

  _mapRow(row) {
    return new Servicio({
      id: row.id,
      nombreServicio: row.nombre_servicio,
      tiempoMin: row.tiempo_min,
      estado: row.estado,
    });
  }
}

module.exports = ServicioRepository;