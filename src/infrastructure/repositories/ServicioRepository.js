const IServicioRepository = require('../../domain/repositories/IServicioRepository');
const Servicio = require('../../domain/entities/Servicio');
const pool = require('../database/db');

class ServicioRepository extends IServicioRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT s.id, s.nombre_servicio, s.tiempo_min, s.estado,
             COALESCE(JSON_AGG(sr.rol ORDER BY sr.rol) FILTER (WHERE sr.rol IS NOT NULL), '[]') AS roles
      FROM servicios s
      LEFT JOIN servicios_rol sr ON sr.servicio_id = s.id
      GROUP BY s.id
      ORDER BY s.nombre_servicio
    `);
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT s.id, s.nombre_servicio, s.tiempo_min, s.estado,
              COALESCE(JSON_AGG(sr.rol ORDER BY sr.rol) FILTER (WHERE sr.rol IS NOT NULL), '[]') AS roles
       FROM servicios s
       LEFT JOIN servicios_rol sr ON sr.servicio_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async create({ nombreServicio, tiempoMin, roles = [] }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO servicios (nombre_servicio, tiempo_min) VALUES ($1, $2) RETURNING id`,
        [nombreServicio, tiempoMin || 30]
      );
      const id = rows[0].id;
      for (const rol of roles) {
        await client.query(
          `INSERT INTO servicios_rol (servicio_id, rol) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, rol]
        );
      }
      await client.query('COMMIT');
      return id;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async update(id, { nombreServicio, tiempoMin, estado, roles }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE servicios SET nombre_servicio = $1, tiempo_min = $2, estado = $3 WHERE id = $4`,
        [nombreServicio, tiempoMin, estado, id]
      );
      if (Array.isArray(roles)) {
        await client.query('DELETE FROM servicios_rol WHERE servicio_id = $1', [id]);
        for (const rol of roles) {
          await client.query(
            `INSERT INTO servicios_rol (servicio_id, rol) VALUES ($1, $2)`,
            [id, rol]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async findByRol(rol) {
    const rolNormalizado = this._normalizeRol(rol);
    const { rows } = await pool.query(
      `SELECT s.id, s.nombre_servicio, s.tiempo_min, s.estado
       FROM servicios s
       INNER JOIN servicios_rol sr ON sr.servicio_id = s.id
       WHERE sr.rol = $1 AND s.estado = true
       ORDER BY s.nombre_servicio`,
      [rolNormalizado]
    );
    return rows.map(row => this._mapRow(row));
  }

  _normalizeRol(rol) {
    const value = (rol || '').toString().trim().toUpperCase();
    if (['MEDICO', 'DOCTOR', 'DOCTORA'].includes(value)) return 'Doctora';
    if (value === 'ASISTENTE') return 'Asistente';
    if (value === 'PACIENTE') return 'Paciente';
    return rol;
  }

  _mapRow(row) {
    return new Servicio({
      id: row.id,
      nombreServicio: row.nombre_servicio,
      tiempoMin: row.tiempo_min,
      estado: row.estado,
      roles: row.roles || [],
    });
  }
}

module.exports = ServicioRepository;
