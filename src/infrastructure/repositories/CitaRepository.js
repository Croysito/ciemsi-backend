const ICitaRepository = require('../../domain/repositories/ICitaRepository');
const CitaMedica = require('../../domain/entities/CitaMedica');
const Paciente = require('../../domain/entities/Paciente');
const Servicio = require('../../domain/entities/Servicio');
const Ciudad = require('../../domain/entities/Ciudad');
const Usuario = require('../../domain/entities/Usuario');
const Rol = require('../../domain/entities/Rol');
const pool = require('../database/db');

class CitaRepository extends ICitaRepository {
  async findAll() {
    const { rows } = await pool.query(this._baseQuery() + ' ORDER BY c.fecha DESC, c.hora ASC');
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const { rows } = await pool.query(
      this._baseQuery() + ' WHERE c.id = $1', [id]
    );
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByCiudad(ciudadId) {
    const { rows } = await pool.query(
      this._baseQuery() + ' WHERE c.ciudad_id = $1 ORDER BY c.fecha DESC, c.hora ASC',
      [ciudadId]
    );
    return rows.map(row => this._mapRow(row));
  }

  async findByPaciente(pacienteId) {
    const { rows } = await pool.query(
      this._baseQuery() + ' WHERE c.paciente_id = $1 ORDER BY c.fecha DESC, c.hora ASC',
      [pacienteId]
    );
    return rows.map(row => this._mapRow(row));
  }

  async findByFechaYCiudad(fecha, ciudadId) {
    const { rows } = await pool.query(
      this._baseQuery() + ' WHERE c.fecha = $1 AND c.ciudad_id = $2 ORDER BY c.hora ASC',
      [fecha, ciudadId]
    );
    return rows.map(row => this._mapRow(row));
  }

  async create({ fecha, hora, pacienteId, servicioId, ciudadId, notas, creadoPor }) {
    const { rows } = await pool.query(
      `INSERT INTO citas_medicas (fecha, hora, paciente_id, servicio_id, ciudad_id, notas, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [fecha, hora, pacienteId, servicioId, ciudadId, notas || null, creadoPor]
    );
    return rows[0].id;
  }

  async updateEstado(id, estado, notas) {
    await pool.query(
      `UPDATE citas_medicas SET estado = $1, notas = COALESCE($2, notas), 
       updated_at = NOW() WHERE id = $3`,
      [estado, notas || null, id]
    );
  }

  async updateComprobante(id, comprobantePath) {
    await pool.query(
      'UPDATE citas_medicas SET comprobante_path = $1, updated_at = NOW() WHERE id = $2',
      [comprobantePath, id]
    );
  }

  async updateAdelanto(id, { monto, metodo }) {
    await pool.query(
      `UPDATE citas_medicas SET adelanto_monto = $1, adelanto_metodo = $2, updated_at = NOW() WHERE id = $3`,
      [monto, metodo, id]
    );
  }

  async update(id, { fecha, hora, servicioId, notas }) {
    await pool.query(
      `UPDATE citas_medicas SET fecha = $1, hora = $2, servicio_id = $3,
       notas = $4, estado = 'MODIFICADA', updated_at = NOW() WHERE id = $5`,
      [fecha, hora, servicioId, notas || null, id]
    );
  }

  _baseQuery() {
    return `
      SELECT c.id, c.fecha, c.hora, c.estado, c.notas, c.created_at,
             c.adelanto_monto, c.adelanto_metodo, c.comprobante_path,
             p.id as paciente_id, p.ci,
             u.id as usuario_id, u.nombre, u.apellido, u.email, u.estado as usuario_estado,
             r.id as rol_id, r.nombre_rol,
             cu.id as ciudad_usuario_id, cu.nombre_ciudad as ciudad_usuario_nombre,
             s.id as servicio_id, s.nombre_servicio, s.tiempo_min,
             ci.id as ciudad_id, ci.nombre_ciudad,
             cr.id as creado_por_id, cr.nombre as creado_por_nombre,
             cr.apellido as creado_por_apellido
      FROM citas_medicas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades cu ON u.ciudad_id = cu.id
      INNER JOIN servicios s ON c.servicio_id = s.id
      INNER JOIN ciudades ci ON c.ciudad_id = ci.id
      INNER JOIN usuarios cr ON c.creado_por = cr.id
    `;
  }

  _mapRow(row) {
    const rol = new Rol({ id: row.rol_id, nombreRol: row.nombre_rol });
    const ciudadUsuario = row.ciudad_usuario_id ? new Ciudad({
      id: row.ciudad_usuario_id,
      nombreCiudad: row.ciudad_usuario_nombre,
    }) : null;
    const usuario = new Usuario({
      id: row.usuario_id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      estado: row.usuario_estado,
      rol,
      ciudad: ciudadUsuario,
    });
    const paciente = new Paciente({
      id: row.paciente_id,
      ci: row.ci,
      usuario,
    });
    const servicio = new Servicio({
      id: row.servicio_id,
      nombreServicio: row.nombre_servicio,
      tiempoMin: row.tiempo_min,
    });
    const ciudad = new Ciudad({
      id: row.ciudad_id,
      nombreCiudad: row.nombre_ciudad,
    });
    return new CitaMedica({
      id: row.id,
      fecha: row.fecha,
      hora: row.hora,
      paciente,
      servicio,
      ciudad,
      estado: row.estado,
      notas: row.notas,
      adelantoMonto:    row.adelanto_monto   ? parseFloat(row.adelanto_monto)   : null,
      adelantoMetodo:   row.adelanto_metodo  ?? null,
      comprobantePath:  row.comprobante_path ?? null,
      creadoPor: {
        id: row.creado_por_id,
        nombre: row.creado_por_nombre,
        apellido: row.creado_por_apellido,
      },
      createdAt: row.created_at,
    });
  }
}

module.exports = CitaRepository;