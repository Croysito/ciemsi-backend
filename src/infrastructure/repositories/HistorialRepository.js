const IHistorialRepository = require('../../domain/repositories/IHistorialRepository');
const HistorialClinico = require('../../domain/entities/HistorialClinico');
const NotasEvolucion = require('../../domain/entities/NotasEvolucion');
const Link = require('../../domain/entities/Link');
const pool = require('../database/db');

class HistorialRepository extends IHistorialRepository {
  async findByPacienteId(pacienteId) {
    const query = `
      SELECT id, fecha, paciente_id
      FROM historial_clinico
      WHERE paciente_id = $1
    `;
    const { rows } = await pool.query(query, [pacienteId]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new HistorialClinico({
      id: row.id,
      fecha: row.fecha,
      pacienteId: row.paciente_id,
    });
  }

  async create(pacienteId) {
    const query = `
      INSERT INTO historial_clinico (paciente_id)
      VALUES ($1)
      RETURNING id, fecha
    `;
    const { rows } = await pool.query(query, [pacienteId]);
    return new HistorialClinico({
      id: rows[0].id,
      fecha: rows[0].fecha,
      pacienteId,
    });
  }

  async addNota(nota) {
    const query = `
      INSERT INTO notas_evolucion (fecha, detalle, historial_id)
      VALUES ($1, $2, $3)
      RETURNING id, fecha
    `;
    const { rows } = await pool.query(query, [
      nota.fecha,
      nota.detalle,
      nota.historialId,
    ]);
    return new NotasEvolucion({
      id: rows[0].id,
      fecha: rows[0].fecha,
      detalle: nota.detalle,
      historialId: nota.historialId,
    });
  }

  async getNotas(historialId) {
    const query = `
      SELECT id, fecha, detalle, historial_id
      FROM notas_evolucion
      WHERE historial_id = $1
      ORDER BY fecha DESC
    `;
    const { rows } = await pool.query(query, [historialId]);
    return rows.map(row => new NotasEvolucion({
      id: row.id,
      fecha: row.fecha,
      detalle: row.detalle,
      historialId: row.historial_id,
    }));
  }

  async addLink(link) {
    const query = `
      INSERT INTO links (nombre, link, tipo, nota_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const { rows } = await pool.query(query, [
      link.nombre,
      link.link,
      link.tipo,
      link.notaId,
    ]);
    return new Link({
      id: rows[0].id,
      nombre: link.nombre,
      link: link.link,
      tipo: link.tipo,
      notaId: link.notaId,
    });
  }

  async getLinksByNota(notaId) {
    const query = `
      SELECT id, nombre, link, tipo, nota_id
      FROM links
      WHERE nota_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [notaId]);
    return rows.map(row => new Link({
      id: row.id,
      nombre: row.nombre,
      link: row.link,
      tipo: row.tipo,
      notaId: row.nota_id,
    }));
  }

  async getLinksByTipo(notaId, tipo) {
    const query = `
      SELECT id, nombre, link, tipo, nota_id
      FROM links
      WHERE nota_id = $1 AND tipo = $2
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [notaId, tipo]);
    return rows.map(row => new Link({
      id: row.id,
      nombre: row.nombre,
      link: row.link,
      tipo: row.tipo,
      notaId: row.nota_id,
    }));
  }

  async getPacienteByNotaId(notaId) {
    const query = `
      SELECT u.nombre, u.apellido
      FROM notas_evolucion ne
      JOIN historial_clinico hc ON ne.historial_id = hc.id
      JOIN pacientes p ON hc.paciente_id = p.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE ne.id = $1
    `;
    const { rows } = await pool.query(query, [notaId]);
    if (rows.length === 0) return null;
    return { nombre: rows[0].nombre, apellido: rows[0].apellido };
  }
}

module.exports = HistorialRepository;