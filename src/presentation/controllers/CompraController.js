const RegistrarCompra = require('../../application/use-cases/compras/RegistrarCompra');

class CompraController {
  constructor({ compraRepository, suministroRepository }) {
    this.compraRepository = compraRepository;
    this.registrarCompra = new RegistrarCompra(compraRepository, suministroRepository);
  }

  async listar(req, res) {
    try {
      const { ciudadId } = req.query;
      const compras = await this.compraRepository.findAll(
        ciudadId ? parseInt(ciudadId) : null
      );
      return res.status(200).json(compras);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtener(req, res) {
    try {
      const compra = await this.compraRepository.findById(parseInt(req.params.id));
      if (!compra) {
        return res.status(404).json({ mensaje: 'Compra no encontrada' });
      }
      return res.status(200).json(compra);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async registrar(req, res) {
    try {
      const { fecha, ciudadId, items } = req.body;
      const usuarioId = req.usuario.id;

      if (!ciudadId || !items || items.length === 0) {
        return res.status(400).json({
          mensaje: 'Ciudad e items son requeridos',
        });
      }

      const resultado = await this.registrarCompra.execute({
        fecha, ciudadId, usuarioId, items,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = CompraController;
