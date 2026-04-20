const IPacienteRepository = require('../../domain/repositories/IPacienteRepository');
const Paciente = require('../../domain/entities/Paciente');
const Ciudad = require('../../domain/entities/Ciudad');
const Usuario = require('../../domain/entities/Usuario');
const Rol = require('../../domain/entities/Rol');
const pool = require('../database/db');

class PacienteRepository extends IPacienteRepository {
  async findAll() {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             c.id as ciudad_id, c.nombre_ciudad,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      ORDER BY u.apellido, u.nombre
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             c.id as ciudad_id, c.nombre_ciudad,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByCi(ci) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             c.id as ciudad_id, c.nombre_ciudad,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE p.ci = $1
    `;
    const { rows } = await pool.query(query, [ci]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async create({ ci, edad, telefono, fechaNacimiento, ciudadId, usuarioId }) {
    const query = `
      INSERT INTO pacientes (ci, edad, telefono, fecha_nacimiento, ciudad_id, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const { rows } = await pool.query(query, [
      ci, edad, telefono, fechaNacimiento, ciudadId, usuarioId
    ]);
    return rows[0].id;
  }

  async update(id, { ci, edad, telefono, fechaNacimiento, ciudadId }) {
    const query = `
      UPDATE pacientes
      SET ci = $1, edad = $2, telefono = $3,
          fecha_nacimiento = $4, ciudad_id = $5, updated_at = NOW()
      WHERE id = $6
    `;
    await pool.query(query, [
      ci, edad, telefono, fechaNacimiento, ciudadId, id
    ]);
  }
  async findByUsuarioId(usuarioId) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
            p.usuario_id,
            c.id as ciudad_id, c.nombre_ciudad,
            u.nombre, u.apellido, u.email, u.estado,
            r.id as rol_id, r.nombre_rol
      FROM pacientes p
      INNER JOIN ciudades c ON p.ciudad_id = c.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE p.usuario_id = $1
    `;
    const { rows } = await pool.query(query, [usuarioId]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  _mapRow(row) {
    const ciudad = new Ciudad({ 
      id: row.ciudad_id, 
      nombreCiudad: row.nombre_ciudad 
    });
    const rol = new Rol({ 
      id: row.rol_id, 
      nombreRol: row.nombre_rol 
    });
    const usuario = new Usuario({
      id: row.usuario_id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      estado: row.estado,
      rol,
    });
    return new Paciente({
      id: row.id,
      ci: row.ci,
      edad: row.edad,
      telefono: row.telefono,
      fechaNacimiento: row.fecha_nacimiento,
      ciudad,
      usuario,
    });
  }
}

module.exports = PacienteRepository;