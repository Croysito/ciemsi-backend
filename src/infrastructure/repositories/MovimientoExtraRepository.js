const IMovimientoExtraRepository = require('../../domain/repositories/IMovimientoExtraRepository');
const MovimientoExtra = require('../../domain/entities/MovimientoExtra');
const pool = require('../database/db');

class MovimientoExtraRepository extends IMovimientoExtraRepository {
  async create({ tipo, categoria, descripcion, monto, metodo, ciudadId, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO movimientos_extra (tipo, categoria, descripcion, monto, metodo, ciudad_id, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [tipo, categoria, descripcion || null, monto, metodo, ciudadId, usuarioId]
    );
    const inserted = await this._findById(rows[0].id);
    return inserted;
  }

  async findByCiudad({ ciudadId, tipo, fechaDesde, fechaHasta }) {
    const params = [ciudadId];
    const conditions = ['me.ciudad_id = $1'];
    if (tipo) {
      params.push(tipo);
      conditions.push(`me.tipo = $${params.length}`);
    }
    if (fechaDesde) {
      params.push(fechaDesde);
      conditions.push(`me.fecha >= $${params.length}`);
    }
    if (fechaHasta) {
      params.push(fechaHasta);
      conditions.push(`me.fecha <= $${params.length}`);
    }
    const { rows } = await pool.query(
      `SELECT me.id, me.tipo, me.categoria, me.descripcion, me.monto, me.metodo, me.fecha,
              ci.id AS ciudad_id, ci.nombre_ciudad,
              u.id AS usuario_id, u.nombre AS usuario_nombre
       FROM movimientos_extra me
       INNER JOIN ciudades ci ON ci.id = me.ciudad_id
       INNER JOIN usuarios u ON u.id = me.usuario_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY me.fecha DESC`,
      params
    );
    return rows.map(this._mapRow);
  }

  async deleteById(id) {
    await pool.query('DELETE FROM movimientos_extra WHERE id = $1', [id]);
  }

  async _findById(id) {
    const { rows } = await pool.query(
      `SELECT me.id, me.tipo, me.categoria, me.descripcion, me.monto, me.metodo, me.fecha,
              ci.id AS ciudad_id, ci.nombre_ciudad,
              u.id AS usuario_id, u.nombre AS usuario_nombre
       FROM movimientos_extra me
       INNER JOIN ciudades ci ON ci.id = me.ciudad_id
       INNER JOIN usuarios u ON u.id = me.usuario_id
       WHERE me.id = $1`,
      [id]
    );
    return rows.length ? this._mapRow(rows[0]) : null;
  }

  _mapRow(r) {
    return new MovimientoExtra({
      id: r.id,
      tipo: r.tipo,
      categoria: r.categoria,
      descripcion: r.descripcion,
      monto: parseFloat(r.monto),
      metodo: r.metodo,
      ciudad: { id: r.ciudad_id, nombreCiudad: r.nombre_ciudad },
      usuario: { id: r.usuario_id, nombre: r.usuario_nombre },
      fecha: r.fecha,
    });
  }
}

module.exports = MovimientoExtraRepository;
