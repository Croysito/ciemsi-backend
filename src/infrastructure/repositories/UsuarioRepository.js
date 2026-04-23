const IUsuarioRepository = require('../../domain/repositories/IUsuarioRepository');
const Usuario = require('../../domain/entities/Usuario');
const Rol = require('../../domain/entities/Rol');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class UsuarioRepository extends IUsuarioRepository {
  async findByEmail(email) {
    const query = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.password, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      WHERE u.email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }
  async findByRol(rolId) {
  const query = `
    SELECT u.id, u.nombre, u.apellido, u.email, u.password, u.estado,
           r.id as rol_id, r.nombre_rol,
           c.id as ciudad_id, c.nombre_ciudad
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    LEFT JOIN ciudades c ON u.ciudad_id = c.id
    WHERE u.rol_id = $1
    ORDER BY u.apellido, u.nombre
  `;
  const { rows } = await pool.query(query, [rolId]);
  return rows.map(row => this._mapRow(row));
}

async update(id, { nombre, apellido, email, ciudadId }) {
  const query = `
    UPDATE usuarios
    SET nombre = $1, apellido = $2, email = $3, 
        ciudad_id = $4, updated_at = NOW()
    WHERE id = $5
  `;
  await pool.query(query, [nombre, apellido, email, ciudadId, id]);
}

async updateEstado(id, estado) {
  const query = `
    UPDATE usuarios
    SET estado = $1, updated_at = NOW()
    WHERE id = $2
  `;
  await pool.query(query, [estado, id]);
}

  async findById(id) {
    const query = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.password, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE usuarios 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [hashedPassword, id]);
  }

  async create({ nombre, apellido, email, password, rolId, ciudadId }) {
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, password, rol_id, ciudad_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id
    `;
    const { rows } = await pool.query(query, [
      nombre, apellido, email, password, rolId, ciudadId || null
    ]);
    return rows[0].id;
  }

  _mapRow(row) {
    const rol = new Rol({ id: row.rol_id, nombreRol: row.nombre_rol });
    const ciudad = row.ciudad_id
      ? new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad })
      : null;
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      password: row.password,
      estado: row.estado,
      rol,
      ciudad,
    });
  }
}

module.exports = UsuarioRepository;