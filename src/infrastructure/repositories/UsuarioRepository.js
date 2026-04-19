const IUsuarioRepository = require('../../domain/repositories/IUsuarioRepository');
const Usuario = require('../../domain/entities/Usuario');
const Rol = require('../../domain/entities/Rol');
const pool = require('../database/db');

class UsuarioRepository extends IUsuarioRepository {
  async findByEmail(email) {
    const query = `
      SELECT u.id, u.nombre, u.email, u.password, u.estado,
             r.id as rol_id, r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const rol = new Rol({ id: row.rol_id, nombreRol: row.nombre_rol });
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      password: row.password,
      estado: row.estado,
      rol,
    });
  }

  async findById(id) {
    const query = `
      SELECT u.id, u.nombre, u.email, u.password, u.estado,
             r.id as rol_id, r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const rol = new Rol({ id: row.rol_id, nombreRol: row.nombre_rol });
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      password: row.password,
      estado: row.estado,
      rol,
    });
  }

  async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE usuarios 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [hashedPassword, id]);
  }
}

module.exports = UsuarioRepository;