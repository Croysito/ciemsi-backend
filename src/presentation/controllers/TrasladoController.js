const CrearTraslado    = require('../../application/use-cases/traslados/CrearTraslado');
const ListarTraslados  = require('../../application/use-cases/traslados/ListarTraslados');
const ConfirmarTraslado = require('../../application/use-cases/traslados/ConfirmarTraslado');
const DevolverTraslado = require('../../application/use-cases/traslados/DevolverTraslado');

class TrasladoController {
  constructor({ trasladoRepository }) {
    this.trasladoRepository = trasladoRepository;
    this.crearTraslado    = new CrearTraslado(trasladoRepository);
    this.listarTraslados  = new ListarTraslados(trasladoRepository);
    this.confirmarTraslado = new ConfirmarTraslado(trasladoRepository);
    this.devolverTraslado = new DevolverTraslado(trasladoRepository);
  }

  async stock(req, res) {
    try {
      const { tipo, itemId, ciudadOrigenId } = req.query;
      if (!tipo || !itemId || !ciudadOrigenId) {
        return res.status(400).json({ mensaje: 'tipo, itemId y ciudadOrigenId son requeridos' });
      }
      const disponible = await this.trasladoRepository.getStockDisponible({
        tipo,
        suministroId: tipo === 'SUMINISTRO' ? parseInt(itemId) : null,
        productoId:   tipo === 'PRODUCTO'   ? parseInt(itemId) : null,
        ciudadOrigenId: parseInt(ciudadOrigenId),
      });
      return res.status(200).json({ disponible });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      if (!['Doctora', 'Admin'].includes(req.usuario?.rol)) {
        return res.status(403).json({ mensaje: 'Solo Doctora o Admin pueden crear traslados' });
      }
      const { tipo, suministroId, productoId, ciudadOrigenId, ciudadDestinoId, cantidad } = req.body;
      const resultado = await this.crearTraslado.execute({
        tipo,
        suministroId: suministroId ? parseInt(suministroId) : null,
        productoId:   productoId   ? parseInt(productoId)   : null,
        ciudadOrigenId:   parseInt(ciudadOrigenId),
        ciudadDestinoId:  parseInt(ciudadDestinoId),
        cantidad: parseFloat(cantidad),
        usuarioId: req.usuario.id,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async listar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const resultado = await this.listarTraslados.execute(parseInt(req.query.ciudadId));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async confirmar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const resultado = await this.confirmarTraslado.execute(
        parseInt(req.params.id),
        req.usuario,
      );
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async devolver(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const resultado = await this.devolverTraslado.execute(parseInt(req.params.id));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = TrasladoController;
