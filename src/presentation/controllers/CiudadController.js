const CiudadRepository = require('../../infrastructure/repositories/CiudadRepository');

const ciudadRepository = new CiudadRepository();

class CiudadController {
  async listar(req, res) {
    try {
      const ciudades = await ciudadRepository.findAll();
      return res.status(200).json(ciudades);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = new CiudadController();