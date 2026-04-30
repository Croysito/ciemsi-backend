const ListarSuministros = require('../../application/use-cases/suministros/ListarSuministros');
const CrearSuministro = require('../../application/use-cases/suministros/CrearSuministro');
const ModificarSuministro = require('../../application/use-cases/suministros/ModificarSuministro');
const ObtenerInventario = require('../../application/use-cases/suministros/ObtenerInventario');
const VerificarAlertas = require('../../application/use-cases/suministros/VerificarAlertas');
const SuministroRepository = require('../../infrastructure/repositories/SuministroRepository');

const suministroRepository = new SuministroRepository();

class SuministroController {
  async listar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { tipo } = req.query;
      const useCase = new ListarSuministros(suministroRepository);
      const suministros = await useCase.execute(tipo);
      return res.status(200).json(suministros);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { nombreSuministro, unidadMedida, marca, tipo, umbral } = req.body;
      const useCase = new CrearSuministro(suministroRepository);
      const resultado = await useCase.execute({
        nombreSuministro, unidadMedida, marca, tipo, umbral,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { id } = req.params;
      const useCase = new ModificarSuministro(suministroRepository);
      const resultado = await useCase.execute(parseInt(id), req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async inventario(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { ciudadId } = req.query;
      const useCase = new ObtenerInventario(suministroRepository);
      const resultado = await useCase.execute(parseInt(ciudadId));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async alertas(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { ciudadId } = req.query;
      const useCase = new VerificarAlertas(suministroRepository);
      const resultado = await useCase.execute(parseInt(ciudadId));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = new SuministroController();
