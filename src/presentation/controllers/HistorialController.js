const ObtenerHistorial = require('../../application/use-cases/historial/ObtenerHistorial');
const AgregarNota = require('../../application/use-cases/historial/AgregarNota');
const AgregarLink = require('../../application/use-cases/historial/AgregarLink');
const ObtenerLinksPorTipo = require('../../application/use-cases/historial/ObtenerLinksPorTipo');
const ObtenerMiHistorial = require('../../application/use-cases/historial/ObtenerMiHistorial');

class HistorialController {
  constructor({ historialRepository, pacienteRepository }) {
    this.obtenerHistorial = new ObtenerHistorial(historialRepository);
    this.agregarNotaUseCase = new AgregarNota(historialRepository);
    this.agregarLinkUseCase = new AgregarLink(historialRepository);
    this.obtenerLinksPorTipoUseCase = new ObtenerLinksPorTipo(historialRepository);
    this.obtenerMiHistorial = new ObtenerMiHistorial(historialRepository, pacienteRepository);
  }

  async obtener(req, res) {
    try {
      const historial = await this.obtenerHistorial.execute(parseInt(req.params.pacienteId));
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
      const resultado = await this.agregarNotaUseCase.execute({
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
      const resultado = await this.agregarLinkUseCase.execute({
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
      const links = await this.obtenerLinksPorTipoUseCase.execute({
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
      const resultado = await this.obtenerMiHistorial.execute(parseInt(req.usuario.id));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }
}

module.exports = HistorialController;
