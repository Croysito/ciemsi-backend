const IAgendaRepository = require('../../domain/repositories/IAgendaRepository');
const Agenda = require('../../domain/entities/Agenda');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class AgendaRepository extends IAgendaRepository {
  async findByCiudad(ciudadId) {
    const query = `
      SELECT a.id, a.fecha, a.dias_semana, a.hora_inicio, a.hora_fin,
             a.intervalo, a.estado,
             c.id as ciudad_id, c.nombre_ciudad
      FROM agenda a
      INNER JOIN ciudades c ON a.ciudad_id = c.id
      WHERE a.ciudad_id = $1 AND a.estado = true
      ORDER BY a.fecha, a.hora_inicio
    `;
    const { rows } = await pool.query(query, [ciudadId]);
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

  async create({ fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId }) {
    const { rows } = await pool.query(
      `INSERT INTO agenda (fecha, dias_semana, hora_inicio, hora_fin, intervalo, ciudad_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
      [
        fecha || null,
        diasSemana ? diasSemana : null,
        horaInicio,
        horaFin,
        intervalo || 30,
        ciudadId,
      ]
    );
    return rows[0].id;
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

  _getDiaSemana(fecha) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES',
                  'JUEVES', 'VIERNES', 'SABADO'];
    // Parsear partes directamente para evitar que JS interprete la fecha en UTC
    // y devuelva el día incorrecto en zonas horarias negativas (ej. Bolivia UTC-4)
    const [y, m, d] = fecha.split('-').map(Number);
    return dias[new Date(y, m - 1, d).getDay()];
  }

  _mapRow(row) {
    const ciudad = new Ciudad({
      id: row.ciudad_id,
      nombreCiudad: row.nombre_ciudad,
    });
    return new Agenda({
      id: row.id,
      fecha: row.fecha,
      diasSemana: this._parseDiasSemana(row.dias_semana),
      horaInicio: row.hora_inicio,
      horaFin: row.hora_fin,
      intervalo: row.intervalo,
      ciudad,
      estado: row.estado,
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