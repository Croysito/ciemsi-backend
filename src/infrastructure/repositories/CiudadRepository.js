const ICiudadRepository = require('../../domain/repositories/ICiudadRepository');
const Ciudad = require('../../domain/entities/Ciudad');
const pool = require('../database/db');

class CiudadRepository extends ICiudadRepository {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre_ciudad FROM ciudades ORDER BY nombre_ciudad'
    );
    return rows.map(row => new Ciudad({ id: row.id, nombreCiudad: row.nombre_ciudad }));
  }
}

module.exports = CiudadRepository;