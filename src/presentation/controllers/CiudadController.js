class CiudadController {
  constructor({ listarCiudades }) {
    this.listarCiudades = listarCiudades;
  }

  async listar(req, res) {
    try {
      const ciudades = await this.listarCiudades.execute();
      return res.status(200).json(ciudades);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = CiudadController;
