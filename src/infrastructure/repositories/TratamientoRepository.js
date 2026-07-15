const ITratamientoRepository = require('../../domain/repositories/ITratamientoRepository');
const Tratamiento = require('../../domain/entities/Tratamiento');
const TratamientoAsignado = require('../../domain/entities/TratamientoAsignado');
const AsignadoSupministro = require('../../domain/entities/AsignadoSupministro');
const Suministro = require('../../domain/entities/Suministro');
const CitaMedica = require('../../domain/entities/CitaMedica');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class TratamientoRepository extends ITratamientoRepository {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, nombre_tratamiento, detalle, precio_base
       FROM tratamientos ORDER BY nombre_tratamiento`
    );
    const result = [];
    for (const row of rows) {
      const medicamentosBase = await this.getMedicamentosBase(row.id);
      result.push(this._mapTratamiento(row, medicamentosBase));
    }
    return result;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, nombre_tratamiento, detalle, precio_base
       FROM tratamientos WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    return this._mapTratamiento(rows[0]);
  }

  async create({ nombreTratamiento, detalle, precioBase }) {
    const { rows } = await pool.query(
      `INSERT INTO tratamientos (nombre_tratamiento, detalle, precio_base)
       VALUES ($1, $2, $3) RETURNING id`,
      [nombreTratamiento, detalle, precioBase || 0]
    );
    return rows[0].id;
  }

  async addMedicamentoBase({ tratamientoId, suministroId, cantidad }) {
    await pool.query(
      `INSERT INTO tratamiento_medicamento_base (tratamiento_id, suministro_id, cantidad)
       VALUES ($1, $2, $3)`,
      [tratamientoId, suministroId, cantidad]
    );
  }

  async getMedicamentosBase(tratamientoId) {
    const { rows } = await pool.query(
      `WITH lotes AS (
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
        tmb.suministro_id,
        s.nombre_suministro,
        tmb.cantidad,
        pp.precio_venta_base
      FROM tratamiento_medicamento_base tmb
      INNER JOIN suministros s ON s.id = tmb.suministro_id
      LEFT JOIN precio_peps pp ON pp.suministro_id = tmb.suministro_id
      WHERE tmb.tratamiento_id = $1
      ORDER BY s.nombre_suministro`,
      [tratamientoId]
    );
    return rows.map(row => ({
      suministroId: row.suministro_id,
      nombreSuministro: row.nombre_suministro,
      cantidad: row.cantidad,
      precioVentaBase: row.precio_venta_base ?? null,
    }));
  }

  async update(id, { nombreTratamiento, detalle, precioBase }) {
    await pool.query(
      `UPDATE tratamientos SET nombre_tratamiento = $1, detalle = $2,
       precio_base = $3, updated_at = NOW() WHERE id = $4`,
      [nombreTratamiento, detalle, precioBase, id]
    );
  }

  async asignar({ tratamientoId, citaId, precio }) {
    const { rows } = await pool.query(
      `INSERT INTO tratamiento_asignado (tratamiento_id, cita_id, precio, estado)
       VALUES ($1, $2, $3, 'PENDIENTE') RETURNING id`,
      [tratamientoId, citaId, precio]
    );
    return rows[0].id;
  }

  async findAsignadoById(id) {
    const { rows } = await pool.query(
      this._baseQueryAsignado() + ' WHERE ta.id = $1',
      [id]
    );
    if (rows.length === 0) return null;
    const suministros = await this._getSuministrosAsignados(id);
    return this._mapAsignado(rows[0], suministros);
  }

  async findAsignados() {
    const { rows } = await pool.query(
      this._baseQueryAsignado() + ' ORDER BY cm.fecha DESC, cm.hora ASC'
    );
    const result = [];
    for (const row of rows) {
      const suministros = await this._getSuministrosAsignados(row.ta_id);
      result.push(this._mapAsignado(row, suministros));
    }
    return result;
  }

  async findAsignadosByCiudad(ciudadId) {
    const { rows } = await pool.query(
      this._baseQueryAsignado() + ' WHERE cm.ciudad_id = $1 ORDER BY cm.fecha DESC, cm.hora ASC',
      [ciudadId]
    );
    const result = [];
    for (const row of rows) {
      const suministros = await this._getSuministrosAsignados(row.ta_id);
      result.push(this._mapAsignado(row, suministros));
    }
    return result;
  }

  async findAsignadosByPaciente(pacienteId) {
    const { rows } = await pool.query(
      this._baseQueryAsignado() + ' WHERE cm.paciente_id = $1 ORDER BY cm.fecha DESC, cm.hora ASC',
      [pacienteId]
    );
    const result = [];
    for (const row of rows) {
      const suministros = await this._getSuministrosAsignados(row.ta_id);
      result.push(this._mapAsignado(row, suministros));
    }
    return result;
  }

  async findAsignadosByCita(citaId) {
    const { rows } = await pool.query(
      this._baseQueryAsignado() + ' WHERE ta.cita_id = $1',
      [citaId]
    );
    const result = [];
    for (const row of rows) {
      const suministros = await this._getSuministrosAsignados(row.ta_id);
      result.push(this._mapAsignado(row, suministros));
    }
    return result;
  }

  async addSupministroAsignado({ tratamientoAsignadoId, suministroId, cantidad, agregadoPor }) {
    const { rows } = await pool.query(
      `INSERT INTO asignado_suministro
       (tratamiento_asignado_id, suministro_id, cantidad, agregado_por)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [tratamientoAsignadoId, suministroId, cantidad, agregadoPor]
    );
    return rows[0].id;
  }

  async updateEstadoAsignado(id, estado) {
    await pool.query(
      `UPDATE tratamiento_asignado
       SET estado = $1
       WHERE id = $2`,
      [estado, id]
    );
  }

  async completarTratamiento(id) {
    // vista_inventario suma salidas de tratamientos con estado COMPLETADO,
    // por lo que cambiar el estado aquí descuenta automáticamente el inventario.
    await this.updateEstadoAsignado(id, 'COMPLETADO');
    return { mensaje: 'Tratamiento completado e inventario actualizado' };
  }

  async _getSuministrosAsignados(tratamientoAsignadoId) {
    const { rows } = await pool.query(
      `SELECT asu.id, asu.tratamiento_asignado_id, asu.cantidad, asu.agregado_por,
              s.id as suministro_id, s.nombre_suministro, s.unidad_medida,
              s.tipo, s.marca
       FROM asignado_suministro asu
       INNER JOIN suministros s ON asu.suministro_id = s.id
       WHERE asu.tratamiento_asignado_id = $1`,
      [tratamientoAsignadoId]
    );
    return rows.map(row => new AsignadoSupministro({
      id: row.id,
      tratamientoAsignadoId: row.tratamiento_asignado_id,
      suministro: new Suministro({
        id: row.suministro_id,
        nombreSuministro: row.nombre_suministro,
        unidadMedida: row.unidad_medida,
        tipo: row.tipo,
        marca: row.marca,
      }),
      cantidad: parseFloat(row.cantidad),
      agregadoPor: row.agregado_por,
    }));
  }

  _baseQueryAsignado() {
    return `
      SELECT ta.id as ta_id, ta.precio, ta.estado as ta_estado, ta.created_at,
             t.id as tratamiento_id, t.nombre_tratamiento,
             t.detalle, t.precio_base,
             cm.id as cita_id, cm.fecha, cm.hora, cm.estado as cita_estado,
             ci.id as ciudad_id, ci.nombre_ciudad,
             p.id as paciente_id,
             u.nombre as paciente_nombre, u.apellido as paciente_apellido
      FROM tratamiento_asignado ta
      INNER JOIN tratamientos t ON ta.tratamiento_id = t.id
      INNER JOIN citas_medicas cm ON ta.cita_id = cm.id
      INNER JOIN ciudades ci ON cm.ciudad_id = ci.id
      INNER JOIN pacientes p ON cm.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
    `;
  }

  _mapTratamiento(row, medicamentosBase = []) {
    return new Tratamiento({
      id: row.id,
      nombreTratamiento: row.nombre_tratamiento,
      detalle: row.detalle,
      precioBase: row.precio_base,
      medicamentosBase,
    });
  }

  _mapAsignado(row, suministros) {
    const ciudad = new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad });
    const tratamiento = new Tratamiento({
      id: row.tratamiento_id,
      nombreTratamiento: row.nombre_tratamiento,
      detalle: row.detalle,
      precioBase: row.precio_base,
    });
    const paciente = {
      id: row.paciente_id,
      nombreCompleto: `${row.paciente_nombre} ${row.paciente_apellido}`.trim(),
    };
    const cita = { id: row.cita_id, fecha: row.fecha, hora: row.hora, estado: row.cita_estado, ciudad, paciente };
    return new TratamientoAsignado({
      id: row.ta_id,
      tratamiento,
      cita,
      precio: row.precio,
      estado: row.ta_estado,
      suministros,
      createdAt: row.created_at,
    });
  }
}

module.exports = TratamientoRepository;
