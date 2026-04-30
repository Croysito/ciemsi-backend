const ICompraRepository = require('../../domain/repositories/ICompraRepository');
const Compra = require('../../domain/entities/Compra');
const CompraSupministro = require('../../domain/entities/CompraSupministro');
const Suministro = require('../../domain/entities/Suministro');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class CompraRepository extends ICompraRepository {
  async findAll(ciudadId) {
    const query = ciudadId
      ? `SELECT c.id, c.fecha, c.ciudad_id, ci.nombre_ciudad,
                c.usuario_id, u.nombre, u.apellido
         FROM compras c
         INNER JOIN ciudades ci ON c.ciudad_id = ci.id
         INNER JOIN usuarios u ON c.usuario_id = u.id
         WHERE c.ciudad_id = $1
         ORDER BY c.fecha DESC`
      : `SELECT c.id, c.fecha, c.ciudad_id, ci.nombre_ciudad,
                c.usuario_id, u.nombre, u.apellido
         FROM compras c
         INNER JOIN ciudades ci ON c.ciudad_id = ci.id
         INNER JOIN usuarios u ON c.usuario_id = u.id
         ORDER BY c.fecha DESC`;

    const { rows } = ciudadId
      ? await pool.query(query, [ciudadId])
      : await pool.query(query);

    return rows.map(row => new Compra({
      id: row.id,
      fecha: row.fecha,
      ciudad: new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad }),
      usuario: { id: row.usuario_id, nombre: row.nombre, apellido: row.apellido },
    }));
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT c.id, c.fecha, c.ciudad_id, ci.nombre_ciudad,
              c.usuario_id, u.nombre, u.apellido
       FROM compras c
       INNER JOIN ciudades ci ON c.ciudad_id = ci.id
       INNER JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    if (rows.length === 0) return null;

    const row = rows[0];
    const items = await this._getItems(id);

    return new Compra({
      id: row.id,
      fecha: row.fecha,
      ciudad: new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad }),
      usuario: { id: row.usuario_id, nombre: row.nombre, apellido: row.apellido },
      items,
    });
  }

  async create({ fecha, ciudadId, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO compras (fecha, ciudad_id, usuario_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [fecha, ciudadId, usuarioId]
    );
    return rows[0].id;
  }

  async addItem({ compraId, suministroId, cantidad, precioUnitario, total, fechaVencimiento }) {
    const { rows } = await pool.query(
      `INSERT INTO compra_suministro
       (compra_id, suministro_id, cantidad, precio_unitario, total, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [compraId, suministroId, cantidad, precioUnitario, total, fechaVencimiento || null]
    );
    return rows[0].id;
  }

  async _getItems(compraId) {
    const { rows } = await pool.query(
      `SELECT cs.id, cs.compra_id, cs.cantidad, cs.precio_unitario,
              cs.total, cs.fecha_vencimiento,
              s.id as suministro_id, s.nombre_suministro,
              s.unidad_medida, s.tipo
       FROM compra_suministro cs
       INNER JOIN suministros s ON cs.suministro_id = s.id
       WHERE cs.compra_id = $1`,
      [compraId]
    );
    return rows.map(row => new CompraSupministro({
      id: row.id,
      compraId: row.compra_id,
      suministro: new Suministro({
        id: row.suministro_id,
        nombreSuministro: row.nombre_suministro,
        unidadMedida: row.unidad_medida,
        tipo: row.tipo,
      }),
      cantidad: row.cantidad,
      precioUnitario: row.precio_unitario,
      total: row.total,
      fechaVencimiento: row.fecha_vencimiento,
    }));
  }
}

module.exports = CompraRepository;