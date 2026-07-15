const ISuministroRepository = require('../../domain/repositories/ISuministroRepository');
const Suministro = require('../../domain/entities/Suministro');
const pool = require('../database/db');

class SuministroRepository extends ISuministroRepository {
  async findAll() {
    const { rows } = await pool.query(this._queryConPreciosPEPS());
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
      this._queryConPreciosPEPS('AND su.tipo = $1'),
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
    return rows.map(r => this._mapInventarioRow(r));
  }

  async getStockBajo(ciudadId) {
    const { rows } = await pool.query(
      `SELECT * FROM vista_inventario
       WHERE ciudad_id = $1 AND stock_bajo = true
       ORDER BY saldo ASC`,
      [ciudadId]
    );
    return rows.map(r => this._mapInventarioRow(r));
  }

  _mapInventarioRow(r) {
    return {
      id: parseInt(r.id) || 0,
      nombre_suministro: r.nombre_suministro,
      unidad_medida: r.unidad_medida,
      marca: r.marca,
      tipo: r.tipo,
      umbral: parseInt(r.umbral) || 5,
      ciudad_id: parseInt(r.ciudad_id) || 0,
      nombre_ciudad: r.nombre_ciudad,
      total_compras: parseFloat(r.total_compras) || 0,
      total_salidas: parseFloat(r.total_salidas) || 0,
      saldo: parseFloat(r.saldo) || 0,
      stock_bajo: r.stock_bajo === true || r.stock_bajo === 'true',
    };
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
         AND cs.fecha_vencimiento <= CURRENT_DATE + ($1::int * INTERVAL '1 day')
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
      precioVentaBase: row.precio_venta_base ?? null,
    });
  }

  _queryConPreciosPEPS(whereExtra = '') {
    return `
      WITH lotes AS (
        SELECT
          cs.suministro_id,
          cs.precio_venta_base,
          SUM(cs.cantidad) OVER (
            PARTITION BY cs.suministro_id
            ORDER BY c.fecha ASC, cs.id ASC
          ) AS cum_entrada
        FROM compra_suministro cs
        INNER JOIN compras c ON c.id = cs.compra_id
        WHERE cs.precio_venta_base IS NOT NULL
      ),
      salidas AS (
        SELECT
          asu.suministro_id,
          COALESCE(SUM(asu.cantidad), 0) AS total_salidas
        FROM asignado_suministro asu
        INNER JOIN tratamiento_asignado ta ON ta.id = asu.tratamiento_asignado_id
        WHERE ta.estado = 'COMPLETADO'
        GROUP BY asu.suministro_id
      ),
      precio_peps AS (
        SELECT DISTINCT ON (l.suministro_id)
          l.suministro_id,
          l.precio_venta_base
        FROM lotes l
        LEFT JOIN salidas s ON s.suministro_id = l.suministro_id
        WHERE l.cum_entrada > COALESCE(s.total_salidas, 0)
        ORDER BY l.suministro_id, l.cum_entrada ASC
      )
      SELECT
        su.id, su.nombre_suministro, su.unidad_medida, su.marca,
        su.tipo, su.umbral, su.estado,
        pp.precio_venta_base
      FROM suministros su
      LEFT JOIN precio_peps pp ON pp.suministro_id = su.id
      WHERE su.estado = true ${whereExtra}
      ORDER BY su.nombre_suministro
    `;
  }
}

module.exports = SuministroRepository;