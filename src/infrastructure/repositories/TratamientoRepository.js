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
    return rows.map(row => this._mapTratamiento(row));
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
    // 1. Obtener suministros del tratamiento asignado
    const suministros = await this._getSuministrosAsignados(id);

    // 2. Descontar del inventario cada suministro
    // El inventario es calculado, no hay tabla física que actualizar
    // Solo necesitamos que los registros de asignado_suministro existan
    // La vista los resta automáticamente

    // 3. Actualizar solo el estado del tratamiento asignado.
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
      cantidad: row.cantidad,
      agregadoPor: row.agregado_por,
    }));
  }

  _baseQueryAsignado() {
    return `
      SELECT ta.id as ta_id, ta.precio, ta.estado as ta_estado, ta.created_at,
             t.id as tratamiento_id, t.nombre_tratamiento,
             t.detalle, t.precio_base,
             cm.id as cita_id, cm.fecha, cm.hora, cm.estado as cita_estado,
             ci.id as ciudad_id, ci.nombre_ciudad
      FROM tratamiento_asignado ta
      INNER JOIN tratamientos t ON ta.tratamiento_id = t.id
      INNER JOIN citas_medicas cm ON ta.cita_id = cm.id
      INNER JOIN ciudades ci ON cm.ciudad_id = ci.id
    `;
  }

  _mapTratamiento(row) {
    return new Tratamiento({
      id: row.id,
      nombreTratamiento: row.nombre_tratamiento,
      detalle: row.detalle,
      precioBase: row.precio_base,
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
    const cita = { id: row.cita_id, fecha: row.fecha, hora: row.hora, estado: row.cita_estado, ciudad };
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
