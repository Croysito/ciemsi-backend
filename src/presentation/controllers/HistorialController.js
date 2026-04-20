const ObtenerHistorial = require('../../application/use-cases/historial/ObtenerHistorial');
const AgregarNota = require('../../application/use-cases/historial/AgregarNota');
const AgregarLink = require('../../application/use-cases/historial/AgregarLink');
const ObtenerLinksPorTipo = require('../../application/use-cases/historial/ObtenerLinksPorTipo');
const HistorialRepository = require('../../infrastructure/repositories/HistorialRepository');
const ObtenerMiHistorial = require('../../application/use-cases/historial/ObtenerMiHistorial');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');


const historialRepository = new HistorialRepository();
const pacienteRepository = new PacienteRepository();

class HistorialController {
  async obtener(req, res) {
    try {
      const { pacienteId } = req.params;
      const useCase = new ObtenerHistorial(historialRepository);
      const historial = await useCase.execute(parseInt(pacienteId));
      return res.status(200).json(historial);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }

  async agregarNota(req, res) {
    try {
      const { pacienteId } = req.params;
      const { detalle } = req.body;

      if (!detalle) {
        return res.status(400).json({ mensaje: 'El detalle de la nota es requerido' });
      }

      const useCase = new AgregarNota(historialRepository);
      const resultado = await useCase.execute({
        pacienteId: parseInt(pacienteId),
        detalle,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async agregarLink(req, res) {
    try {
      const { notaId } = req.params;
      const { nombre, link, tipo } = req.body;

      if (!nombre || !link || !tipo) {
        return res.status(400).json({ mensaje: 'Nombre, link y tipo son requeridos' });
      }

      const useCase = new AgregarLink(historialRepository);
      const resultado = await useCase.execute({
        notaId: parseInt(notaId),
        nombre,
        link,
        tipo,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async obtenerLinksPorTipo(req, res) {
    try {
      const { notaId } = req.params;
      const { tipo } = req.query;

      if (!tipo) {
        return res.status(400).json({ mensaje: 'El tipo es requerido' });
      }

      const useCase = new ObtenerLinksPorTipo(historialRepository);
      const links = await useCase.execute({
        notaId: parseInt(notaId),
        tipo: tipo.toUpperCase(),
      });
      return res.status(200).json(links);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
  async miHistorial(req, res) {
    try {
      console.log('Usuario del token:', req.usuario);
      const usuarioId = parseInt(req.usuario.id);
      console.log('Usuario ID parseado:', usuarioId);
      
      const useCase = new ObtenerMiHistorial(
        historialRepository,
        pacienteRepository
      );
      const resultado = await useCase.execute(usuarioId);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }
  async miHistorial(req, res) {
  try {
    const usuarioId = parseInt(req.usuario.id);
    const useCase = new ObtenerMiHistorial(
      historialRepository,
      pacienteRepository
    );
    const resultado = await useCase.execute(usuarioId);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(404).json({ mensaje: error.message });
  }
}
}

module.exports = new HistorialController();