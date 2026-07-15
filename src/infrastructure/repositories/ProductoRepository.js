const IProductoRepository = require('../../domain/repositories/IProductoRepository');
const Producto = require('../../domain/entities/Producto');
const CompraProducto = require('../../domain/entities/CompraProducto');
const pool = require('../database/db');

class ProductoRepository extends IProductoRepository {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, unidad_medida, precio_venta, umbral, estado, created_at
       FROM productos ORDER BY nombre`
    );
    return rows.map(r => this._mapProducto(r));
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, unidad_medida, precio_venta, umbral, estado, created_at
       FROM productos WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    return this._mapProducto(rows[0]);
  }

  async create({ nombre, descripcion, unidadMedida, precioVenta, umbral }) {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, unidad_medida, precio_venta, umbral)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, descripcion || null, unidadMedida, precioVenta, umbral || 0]
    );
    return rows[0].id;
  }

  async update(id, { nombre, descripcion, unidadMedida, precioVenta, umbral, estado }) {
    await pool.query(
      `UPDATE productos SET nombre = $1, descripcion = $2, unidad_medida = $3,
       precio_venta = $4, umbral = $5, estado = $6 WHERE id = $7`,
      [nombre, descripcion || null, unidadMedida, precioVenta, umbral, estado, id]
    );
  }

  async getInventario(ciudadId) {
    const { rows } = await pool.query(
      `SELECT * FROM vista_inventario_productos WHERE ciudad_id = $1 ORDER BY nombre`,
      [ciudadId]
    );
    return rows.map(r => ({
      id: parseInt(r.id) || 0,
      nombre: r.nombre,
      descripcion: r.descripcion,
      unidad_medida: r.unidad_medida,
      precio_venta: parseFloat(r.precio_venta) || 0,
      umbral: parseInt(r.umbral) || 0,
      estado: r.estado,
      ciudad_id: parseInt(r.ciudad_id) || 0,
      nombre_ciudad: r.nombre_ciudad,
      total_compras: parseFloat(r.total_compras) || 0,
      total_ventas: parseFloat(r.total_ventas) || 0,
      saldo: parseFloat(r.saldo) || 0,
      stock_bajo: r.stock_bajo === true || r.stock_bajo === 'true',
    }));
  }

  // Usa la tabla compras (compartida con suministros) + compra_producto como intermedia
  async createCompra({ fecha, ciudadId, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO compras (fecha, ciudad_id, usuario_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [fecha, ciudadId, usuarioId]
    );
    return rows[0].id;
  }

  async addCompraItem({ compraId, productoId, cantidad, precioUnitario }) {
    await pool.query(
      `INSERT INTO compra_producto (compra_id, producto_id, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)`,
      [compraId, productoId, cantidad, precioUnitario]
    );
  }

  async findAllCompras(ciudadId) {
    const base = `
      SELECT c.id, c.fecha,
             json_build_object('id', ci.id, 'nombreCiudad', ci.nombre_ciudad) AS ciudad,
             json_build_object('id', u.id, 'nombre', u.nombre, 'apellido', u.apellido) AS created_by,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', cp.id,
                   'producto', json_build_object('id', p.id, 'nombre', p.nombre, 'unidadMedida', p.unidad_medida),
                   'cantidad', cp.cantidad,
                   'precioUnitario', cp.precio_unitario
                 ) ORDER BY cp.id
               ) FILTER (WHERE cp.id IS NOT NULL), '[]'
             ) AS items
      FROM compras c
      JOIN ciudades ci ON ci.id = c.ciudad_id
      JOIN usuarios u ON u.id = c.usuario_id
      -- solo compras que tengan al menos un item de producto
      INNER JOIN compra_producto cp ON cp.compra_id = c.id
      LEFT JOIN productos p ON p.id = cp.producto_id
      ${ciudadId ? 'WHERE c.ciudad_id = $1' : ''}
      GROUP BY c.id, ci.id, u.id
      ORDER BY c.fecha DESC, c.id DESC`;

    const { rows } = ciudadId
      ? await pool.query(base, [ciudadId])
      : await pool.query(base);

    return rows.map(r => new CompraProducto({
      id: r.id,
      ciudad: r.ciudad,
      fecha: r.fecha,
      items: r.items,
      createdBy: r.created_by,
      createdAt: r.fecha,
    }));
  }

  async toggleEstado(id) {
    const { rows } = await pool.query(
      `UPDATE productos SET estado = NOT estado WHERE id = $1 RETURNING estado`,
      [id]
    );
    return rows[0]?.estado;
  }

  _mapProducto(row) {
    return new Producto({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      unidadMedida: row.unidad_medida,
      precioVenta: parseFloat(row.precio_venta),
      umbral: row.umbral,
      estado: row.estado,
      createdAt: row.created_at,
    });
  }
}

module.exports = ProductoRepository;
