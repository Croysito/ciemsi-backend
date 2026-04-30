const ISuministroRepository = require('../../domain/repositories/ISuministroRepository');
const Suministro = require('../../domain/entities/Suministro');
const pool = require('../database/db');

class SuministroRepository extends ISuministroRepository {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, nombre_suministro, unidad_medida, marca, tipo, umbral, estado
       FROM suministros WHERE estado = true ORDER BY nombre_suministro`
    );
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, nombre_suministro, unidad_medida, marca, tipo, umbral, estado
       FROM suministros WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByTipo(tipo) {
    const { rows } = await pool.query(
      `SELECT id, nombre_suministro, unidad_medida, marca, tipo, umbral, estado
       FROM suministros WHERE tipo = $1 AND estado = true
       ORDER BY nombre_suministro`,
      [tipo]
    );
    return rows.map(row => this._mapRow(row));
  }

  async create({ nombreSuministro, unidadMedida, marca, tipo, umbral }) {
    const { rows } = await pool.query(
      `INSERT INTO suministros (nombre_suministro, unidad_medida, marca, tipo, umbral)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombreSuministro, unidadMedida, marca, tipo, umbral || 5]
    );
    return rows[0].id;
  }

  async update(id, { nombreSuministro, unidadMedida, marca, tipo, umbral, estado }) {
    await pool.query(
      `UPDATE suministros SET nombre_suministro = $1, unidad_medida = $2,
       marca = $3, tipo = $4, umbral = $5, estado = $6 WHERE id = $7`,
      [nombreSuministro, unidadMedida, marca, tipo, umbral, estado, id]
    );
  }

  async getInventario(ciudadId) {
    const { rows } = await pool.query(
      `SELECT * FROM vista_inventario WHERE ciudad_id = $1
       ORDER BY nombre_suministro`,
      [ciudadId]
    );
    return rows;
  }

  async getStockBajo(ciudadId) {
    const { rows } = await pool.query(
      `SELECT * FROM vista_inventario
       WHERE ciudad_id = $1 AND stock_bajo = true
       ORDER BY saldo ASC`,
      [ciudadId]
    );
    return rows;
  }

  async getProximosAVencer(dias) {
    const { rows } = await pool.query(
      `SELECT cs.id, s.nombre_suministro, cs.cantidad,
              cs.fecha_vencimiento, c.ciudad_id, ci.nombre_ciudad,
              cs.fecha_vencimiento - CURRENT_DATE as dias_restantes
       FROM compra_suministro cs
       INNER JOIN suministros s ON cs.suministro_id = s.id
       INNER JOIN compras c ON cs.compra_id = c.id
       INNER JOIN ciudades ci ON c.ciudad_id = ci.id
       WHERE cs.fecha_vencimiento IS NOT NULL
         AND cs.fecha_vencimiento <= CURRENT_DATE + $1
         AND cs.fecha_vencimiento >= CURRENT_DATE
       ORDER BY cs.fecha_vencimiento ASC`,
      [dias]
    );
    return rows;
  }

  _mapRow(row) {
    return new Suministro({
      id: row.id,
      nombreSuministro: row.nombre_suministro,
      unidadMedida: row.unidad_medida,
      marca: row.marca,
      tipo: row.tipo,
      umbral: row.umbral,
      estado: row.estado,
    });
  }
}

module.exports = SuministroRepository;