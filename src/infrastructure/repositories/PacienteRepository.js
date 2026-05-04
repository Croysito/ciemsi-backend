const IPacienteRepository = require('../../domain/repositories/IPacienteRepository');
const Paciente = require('../../domain/entities/Paciente');
const Ciudad = require('../../domain/entities/Ciudad');
const Usuario = require('../../domain/entities/Usuario');
const Rol = require('../../domain/entities/Rol');
const pool = require('../database/db');
const bcrypt = require('bcryptjs');

class PacienteRepository extends IPacienteRepository {
  async findAll() {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      ORDER BY u.apellido, u.nombre
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => this._mapRow(row));
  }

  async findById(id) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
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
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      WHERE p.ci = $1
    `;
    const { rows } = await pool.query(query, [ci]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByUsuarioId(usuarioId) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      WHERE p.usuario_id = $1
    `;
    const { rows } = await pool.query(query, [usuarioId]);
    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  async findByCiudad(ciudadId) {
    const query = `
      SELECT p.id, p.ci, p.edad, p.telefono, p.fecha_nacimiento,
             p.usuario_id,
             u.nombre, u.apellido, u.email, u.estado,
             r.id as rol_id, r.nombre_rol,
             c.id as ciudad_id, c.nombre_ciudad
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN ciudades c ON u.ciudad_id = c.id
      WHERE u.ciudad_id = $1
      ORDER BY u.apellido, u.nombre
    `;
    const { rows } = await pool.query(query, [ciudadId]);
    return rows.map(row => this._mapRow(row));
  }

  async create({ ci, edad, telefono, fechaNacimiento, usuarioId }) {
    const query = `
      INSERT INTO pacientes (ci, edad, telefono, fecha_nacimiento, usuario_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const { rows } = await pool.query(query, [
      ci, edad, telefono, fechaNacimiento, usuarioId
    ]);
    return rows[0].id;
  }

  async createProvisional({ nombreCompleto, telefono, ciudadId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const nombre = nombreCompleto.trim();
      const apellido = '';
      const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const ci = `PROV-${uniqueSuffix}`;
      const email = `provisional.${uniqueSuffix}@ciemsi.local`;
      const password = await bcrypt.hash(ci, 10);

      const usuarioResult = await client.query(
        `INSERT INTO usuarios (nombre, apellido, email, password, rol_id, ciudad_id, estado)
         VALUES ($1, $2, $3, $4, 3, $5, true)
         RETURNING id`,
        [nombre, apellido, email, password, ciudadId]
      );
      const usuarioId = usuarioResult.rows[0].id;

      const pacienteResult = await client.query(
        `INSERT INTO pacientes (ci, edad, telefono, fecha_nacimiento, usuario_id)
         VALUES ($1, NULL, $2, NULL, $3)
         RETURNING id`,
        [ci, telefono, usuarioId]
      );
      const pacienteId = pacienteResult.rows[0].id;

      await client.query(
        `INSERT INTO historial_clinico (paciente_id)
         VALUES ($1)`,
        [pacienteId]
      );

      await client.query('COMMIT');
      return this.findById(pacienteId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId }) {
    // Actualizar ciudad en usuarios a través del paciente
    const getPacienteQuery = `
      SELECT usuario_id FROM pacientes WHERE id = $1
    `;
    const { rows } = await pool.query(getPacienteQuery, [id]);
    const usuarioId = rows[0].usuario_id;

    if (nombre !== undefined || apellido !== undefined || email !== undefined) {
      await pool.query(
        `UPDATE usuarios
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             email = COALESCE($3, email),
             ciudad_id = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [nombre || null, apellido || null, email || null, ciudadId, usuarioId]
      );
    } else {
      await pool.query(
        `UPDATE usuarios SET ciudad_id = $1, updated_at = NOW() WHERE id = $2`,
        [ciudadId, usuarioId]
      );
    }

    await pool.query(
      `UPDATE pacientes SET ci = $1, edad = $2, telefono = $3,
       fecha_nacimiento = $4, updated_at = NOW() WHERE id = $5`,
      [ci, edad, telefono, fechaNacimiento, id]
    );
  }
  async completar(id, { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT usuario_id FROM pacientes WHERE id = $1`,
      [id]
    );
    const usuarioId = rows[0].usuario_id;

    // Hash del CI como nueva contraseña
    const passwordHash = await bcrypt.hash(ci, 10);

    await client.query(
      `UPDATE usuarios
       SET nombre = $1, apellido = $2, email = $3,
           password = $4, ciudad_id = $5,
           estado = true, updated_at = NOW()
       WHERE id = $6`,
      [nombre, apellido, email, passwordHash, ciudadId, usuarioId]
    );

    await client.query(
      `UPDATE pacientes
       SET ci = $1, edad = $2, telefono = $3,
           fecha_nacimiento = $4, updated_at = NOW()
       WHERE id = $5`,
      [ci, edad, telefono, fechaNacimiento, id]
    );

    await client.query('COMMIT');
    return this.findById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  _mapRow(row) {
    const rol = new Rol({ id: row.rol_id, nombreRol: row.nombre_rol });
    const ciudad = row.ciudad_id
      ? new Ciudad({ id: row.ciudad_id, nombreCiudad: row.nombre_ciudad })
      : null;
    const usuario = new Usuario({
      id: row.usuario_id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      estado: row.estado,
      rol,
      ciudad,
    });
    return new Paciente({
      id: row.id,
      ci: row.ci,
      edad: row.edad,
      telefono: row.telefono,
      fechaNacimiento: row.fecha_nacimiento,
      usuario,
    });
  }
}


module.exports = PacienteRepository;
