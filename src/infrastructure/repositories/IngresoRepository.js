const IIngresoRepository = require('../../domain/repositories/IIngresoRepository');
const Ingreso = require('../../domain/entities/Ingreso');
const pool = require('../database/db');

class IngresoRepository extends IIngresoRepository {
  async createCobroDeuda({ pacienteId, ciudadId, deudaId, monto, metodo, notas, createdBy }) {
    const { rows } = await pool.query(
      `INSERT INTO ingresos (paciente_id, ciudad_id, tipo, deuda_id, monto, metodo, notas, created_by)
       VALUES ($1, $2, 'cobro_deuda', $3, $4, $5, $6, $7) RETURNING id`,
      [pacienteId, ciudadId, deudaId, monto, metodo, notas || null, createdBy]
    );
    return rows[0].id;
  }

  async createVentaProducto({ pacienteId, ciudadId, monto, metodo, notas, createdBy }) {
    const { rows } = await pool.query(
      `INSERT INTO ingresos (paciente_id, ciudad_id, tipo, monto, metodo, notas, created_by)
       VALUES ($1, $2, 'venta_producto', $3, $4, $5, $6) RETURNING id`,
      [pacienteId, ciudadId, monto, metodo, notas || null, createdBy]
    );
    return rows[0].id;
  }

  async addProductoItem({ ingresoId, productoId, cantidad, precioUnitario, subtotal }) {
    await pool.query(
      `INSERT INTO ingreso_producto_items (ingreso_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [ingresoId, productoId, cantidad, precioUnitario, subtotal]
    );
  }

  async findById(id) {
    const { rows } = await pool.query(this._baseQuery('WHERE i.id = $1'), [id]);
    if (rows.length === 0) return null;
    const items = await this._getItems(id);
    return this._mapRow(rows[0], items);
  }

  async findByPaciente(pacienteId) {
    const { rows } = await pool.query(
      this._baseQuery('WHERE i.paciente_id = $1 ORDER BY i.fecha DESC'),
      [pacienteId]
    );
    return Promise.all(rows.map(async row => {
      const items = row.tipo === 'venta_producto' ? await this._getItems(row.id) : [];
      return this._mapRow(row, items);
    }));
  }

  async _getItems(ingresoId) {
    const { rows } = await pool.query(
      `SELECT ipi.id, ipi.cantidad, ipi.precio_unitario, ipi.subtotal,
              p.id AS producto_id, p.nombre AS producto_nombre, p.unidad_medida
       FROM ingreso_producto_items ipi
       INNER JOIN productos p ON p.id = ipi.producto_id
       WHERE ipi.ingreso_id = $1`,
      [ingresoId]
    );
    return rows.map(r => ({
      id: r.id,
      producto: { id: r.producto_id, nombre: r.producto_nombre, unidadMedida: r.unidad_medida },
      cantidad: parseFloat(r.cantidad),
      precioUnitario: parseFloat(r.precio_unitario),
      subtotal: parseFloat(r.subtotal),
    }));
  }

  _baseQuery(where) {
    return `SELECT i.id, i.tipo, i.monto, i.metodo, i.notas, i.fecha, i.created_at,
                   i.deuda_id,
                   p.id AS paciente_id, up.nombre AS paciente_nombre, up.apellido AS paciente_apellido,
                   ci.id AS ciudad_id, ci.nombre_ciudad,
                   u.id AS created_by_id, u.nombre AS created_by_nombre
            FROM ingresos i
            INNER JOIN pacientes p ON p.id = i.paciente_id
            INNER JOIN usuarios up ON up.id = p.usuario_id
            INNER JOIN ciudades ci ON ci.id = i.ciudad_id
            INNER JOIN usuarios u ON u.id = i.created_by
            ${where}`;
  }

  _mapRow(row, items = []) {
    return new Ingreso({
      id: row.id,
      paciente: { id: row.paciente_id, nombre: row.paciente_nombre, apellido: row.paciente_apellido },
      ciudad: { id: row.ciudad_id, nombreCiudad: row.nombre_ciudad },
      tipo: row.tipo,
      deuda: row.deuda_id ? { id: row.deuda_id } : null,
      monto: parseFloat(row.monto),
      metodo: row.metodo,
      notas: row.notas,
      items,
      fecha: row.fecha,
      createdAt: row.created_at,
      createdBy: { id: row.created_by_id, nombre: row.created_by_nombre },
    });
  }
}

module.exports = IngresoRepository;
