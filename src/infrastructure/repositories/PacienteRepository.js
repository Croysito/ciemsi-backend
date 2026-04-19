const IPacienteRepository = require('../../domain/repositories/IPacienteRepository');
const Paciente = require('../../domain/entities/Paciente');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class PacienteRepository extends IPacienteRepository {
  async findAll() {
    const query = `
      SELECT p.id, p.ci, p.nombre, p.edad, p.telefono, p.fecha_nacimiento,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      ORDER BY p.nombre
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const query = `
      SELECT p.id, p.ci, p.nombre, p.edad, p.telefono, p.fecha_nacimiento,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByCi(ci) {
    const query = `
      SELECT p.id, p.ci, p.nombre, p.edad, p.telefono, p.fecha_nacimiento,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      WHERE p.ci = $1
    `;
    const { rows } = await pool.query(query, [ci]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async create(paciente) {
    const query = `
      INSERT INTO pacientes (ci, nombre, edad, telefono, fecha_nacimiento, ciudad_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const { rows } = await pool.query(query, [
      paciente.ci,
      paciente.nombre,
      paciente.edad,
      paciente.telefono,
      paciente.fechaNacimiento,
      paciente.ciudad.id,
    ]);
    return rows[0].id;
  }

  async update(id, paciente) {
    const query = `
      UPDATE pacientes
      SET ci = $1, nombre = $2, edad = $3, telefono = $4,
          fecha_nacimiento = $5, ciudad_id = $6, updated_at = NOW()
      WHERE id = $7
    `;
    await pool.query(query, [
      paciente.ci,
      paciente.nombre,
      paciente.edad,
      paciente.telefono,
      paciente.fechaNacimiento,
      paciente.ciudad.id,
      id,
    ]);
  }

  _mapRow(row) {
    const ciudad = new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad });
    return new Paciente({
      id: row.id,
      ci: row.ci,
      nombre: row.nombre,
      edad: row.edad,
      telefono: row.telefono,
      fechaNacimiento: row.fecha_nacimiento,
      ciudad,
    });
  }
}

module.exports = PacienteRepository;