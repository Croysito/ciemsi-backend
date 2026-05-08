const ListarServicios = require('../../application/use-cases/servicios/ListarServicios');
const CrearServicio = require('../../application/use-cases/servicios/CrearServicio');
const ModificarServicio = require('../../application/use-cases/servicios/ModificarServicio');
const ServicioRepository = require('../../infrastructure/repositories/ServicioRepository');

const servicioRepository = new ServicioRepository();

class ServicioController {
  async listar(req, res) {
    try {
      const useCase = new ListarServicios(servicioRepository);
      const servicios = await useCase.execute();
      return res.status(200).json(servicios);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const { nombreServicio, tiempoMin } = req.body;
      const useCase = new CrearServicio(servicioRepository);
      const resultado = await useCase.execute({ nombreServicio, tiempoMin });
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
      const servicios = await servicioRepository.findByRol(rol);
      return res.status(200).json(servicios);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { nombreServicio, tiempoMin, estado } = req.body;
      const useCase = new ModificarServicio(servicioRepository);
      const resultado = await useCase.execute(parseInt(id), {
        nombreServicio, tiempoMin, estado
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new ServicioController();