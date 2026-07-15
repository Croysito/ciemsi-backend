const pool = require('../database/db');
const MODULOS_ASISTENTE = require('../../domain/constants/ModulosAsistente');

class AsistentePermisoRepository {
  async findByUsuarioId(usuarioId) {
    const { rows } = await pool.query(
      'SELECT modulo, habilitado FROM asistente_permisos WHERE usuario_id = $1',
      [usuarioId]
    );

    const permisos = {};
    for (const modulo of MODULOS_ASISTENTE) {
      permisos[modulo] = false;
    }
    for (const row of rows) {
      permisos[row.modulo] = row.habilitado;
    }
    return permisos;
  }

  async guardar(usuarioId, permisos) {
    for (const modulo of MODULOS_ASISTENTE) {
      if (!(modulo in permisos)) continue;
      await pool.query(
        `INSERT INTO asistente_permisos (usuario_id, modulo, habilitado)
         VALUES ($1, $2, $3)
         ON CONFLICT (usuario_id, modulo) DO UPDATE SET habilitado = $3`,
        [usuarioId, modulo, !!permisos[modulo]]
      );
    }
  }
}

module.exports = AsistentePermisoRepository;
