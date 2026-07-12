const ListarServicios = require('../../application/use-cases/servicios/ListarServicios');
const CrearServicio = require('../../application/use-cases/servicios/CrearServicio');
const ModificarServicio = require('../../application/use-cases/servicios/ModificarServicio');

class ServicioController {
  constructor({ servicioRepository }) {
    this.servicioRepository = servicioRepository;
    this.listarServicios = new ListarServicios(servicioRepository);
    this.crearServicio = new CrearServicio(servicioRepository);
    this.modificarServicio = new ModificarServicio(servicioRepository);
  }

  async listar(req, res) {
    try {
      const servicios = await this.listarServicios.execute();
      return res.status(200).json(servicios);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const { nombreServicio, tiempoMin, roles } = req.body;
      const resultado = await this.crearServicio.execute({ nombreServicio, tiempoMin, roles: roles || [] });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async listarPorRol(req, res) {
    try {
      const { rol } = req.query;
      if (!rol) {
        return res.status(400).json({ mensaje: 'El parámetro rol es requerido' });
      }
      const servicios = await this.servicioRepository.findByRol(rol);
      return res.status(200).json(servicios);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { nombreServicio, tiempoMin, estado, roles } = req.body;
      const resultado = await this.modificarServicio.execute(parseInt(id), {
        nombreServicio, tiempoMin, estado, roles,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = ServicioController;
