const IAgendaRepository = require('../../domain/repositories/IAgendaRepository');
const Agenda = require('../../domain/entities/Agenda');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class AgendaRepository extends IAgendaRepository {
  async findByCiudad(ciudadId) {
    const filtro = ciudadId ? 'AND a.ciudad_id = $1' : '';
    const params = ciudadId ? [ciudadId] : [];
    const { rows } = await pool.query(`
      SELECT a.id, a.fecha, a.dias_semana, a.hora_inicio, a.hora_fin,
             a.intervalo, a.estado,
             c.id as ciudad_id, c.nombre_ciudad,
             u.id as usuario_id, u.nombre as usuario_nombre,
             u.apellido as usuario_apellido, r.nombre_rol
      FROM agenda a
      INNER JOIN ciudades c ON a.ciudad_id = c.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE 1=1 ${filtro}
      ORDER BY a.fecha NULLS LAST, a.hora_inicio
    `, params);
    return rows.map(row => this._mapRow(row));
  }

  async findDisponibilidad(ciudadId, fecha) {
    // Buscar agendas que apliquen para esa fecha
    // tanto por fecha específica como por día de semana
    const diaSemana = this._getDiaSemana(fecha);
    const query = `
      SELECT a.id, a.fecha, a.dias_semana, a.hora_inicio, a.hora_fin,
             a.intervalo, a.estado,
             c.id as ciudad_id, c.nombre_ciudad
      FROM agenda a
      INNER JOIN ciudades c ON a.ciudad_id = c.id
      WHERE a.ciudad_id = $1
        AND a.estado = true
        AND (
          a.fecha = $2
          OR $3 = ANY(a.dias_semana::text[])
        )
    `;
    const { rows } = await pool.query(query, [ciudadId, fecha, diaSemana]);
    return rows.map(row => this._mapRow(row));
  }

  async create({ fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO agenda (fecha, dias_semana, hora_inicio, hora_fin, intervalo, ciudad_id, usuario_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
      [
        fecha || null,
        diasSemana ? diasSemana : null,
        horaInicio,
        horaFin,
        intervalo || 30,
        ciudadId,
        usuarioId,
      ]
    );
    return rows[0].id;
  }

  async isServicioValidoParaAgenda(ciudadId, fecha, servicioId) {
    const diaSemana = this._getDiaSemana(fecha);
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM agenda a
        INNER JOIN usuarios u ON u.id = a.usuario_id
        INNER JOIN roles r ON r.id = u.rol_id
        INNER JOIN servicios_rol sr ON sr.rol = r.nombre_rol AND sr.servicio_id = $4
        WHERE a.ciudad_id = $1
          AND a.estado = true
          AND (a.fecha = $2 OR $3 = ANY(a.dias_semana::text[]))
      ) AS valido
    `, [ciudadId, fecha, diaSemana, servicioId]);
    return rows[0].valido;
  }

  async update(id, { fecha, diasSemana, horaInicio, horaFin, intervalo, estado }) {
    await pool.query(
      `UPDATE agenda SET fecha = $1, dias_semana = $2, hora_inicio = $3,
       hora_fin = $4, intervalo = $5, estado = $6 WHERE id = $7`,
      [fecha || null, diasSemana || null, horaInicio, horaFin, intervalo, estado, id]
    );
  }

  async delete(id) {
    await pool.query('UPDATE agenda SET estado = false WHERE id = $1', [id]);
  }

  async updateEstado(id, estado) {
    await pool.query('UPDATE agenda SET estado = $1 WHERE id = $2', [estado, id]);
  }

  _getDiaSemana(fecha) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES',
                  'JUEVES', 'VIERNES', 'SABADO'];
    // Parsear partes directamente para evitar que JS interprete la fecha en UTC
    // y devuelva el día incorrecto en zonas horarias negativas (ej. Bolivia UTC-4)
    const [y, m, d] = fecha.split('-').map(Number);
    return dias[new Date(y, m - 1, d).getDay()];
  }

  _mapRow(row) {
    const ciudad = new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad });
    const usuario = row.usuario_id ? {
      id: row.usuario_id,
      nombre: row.usuario_nombre,
      apellido: row.usuario_apellido,
      rol: row.nombre_rol,
    } : null;
    return new Agenda({
      id: row.id,
      fecha: row.fecha,
      diasSemana: this._parseDiasSemana(row.dias_semana),
      horaInicio: row.hora_inicio,
      horaFin: row.hora_fin,
      intervalo: row.intervalo,
      ciudad,
      estado: row.estado,
      usuario,
    });
  }

  _parseDiasSemana(value) {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    // Formato PostgreSQL TEXT: "{LUNES,MARTES}" → ["LUNES", "MARTES"]
    if (typeof value === 'string' && value.startsWith('{')) {
      const inner = value.slice(1, -1);
      return inner ? inner.split(',') : [];
    }
    return null;
  }
}

module.exports = AgendaRepository;