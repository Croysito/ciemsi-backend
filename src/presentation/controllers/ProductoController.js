const ListarProductos = require('../../application/use-cases/productos/ListarProductos');
const ListarComprasProducto = require('../../application/use-cases/productos/ListarComprasProducto');
const CrearProducto = require('../../application/use-cases/productos/CrearProducto');
const ModificarProducto = require('../../application/use-cases/productos/ModificarProducto');
const RegistrarCompraProducto = require('../../application/use-cases/productos/RegistrarCompraProducto');

class ProductoController {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
    this.listarProductos = new ListarProductos(productoRepository);
    this.listarComprasProducto = new ListarComprasProducto(productoRepository);
    this.crearProducto = new CrearProducto(productoRepository);
    this.modificarProducto = new ModificarProducto(productoRepository);
    this.registrarCompra = new RegistrarCompraProducto(productoRepository);
  }

  async listar(req, res) {
    try {
      const productos = await this.listarProductos.execute();
      return res.status(200).json(productos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const { nombre, descripcion, unidadMedida, precioVenta, umbral } = req.body;
      const producto = await this.crearProducto.execute({ nombre, descripcion, unidadMedida, precioVenta, umbral });
      return res.status(201).json(producto);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const producto = await this.modificarProducto.execute(parseInt(req.params.id), req.body);
      return res.status(200).json(producto);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async inventario(req, res) {
    try {
      const ciudadId = parseInt(req.params.ciudadId);
      const inventario = await this.productoRepository.getInventario(ciudadId);
      return res.status(200).json(inventario);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async registrarCompraProducto(req, res) {
    try {
      const { ciudadId, fecha, items } = req.body;
      const usuarioId = req.usuario.id;
      const resultado = await this.registrarCompra.execute({
        ciudadId: parseInt(ciudadId),
        fecha,
        usuarioId,
        items,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async listarCompras(req, res) {
    try {
      const ciudadId = req.query.ciudadId ? parseInt(req.query.ciudadId) : null;
      const compras = await this.listarComprasProducto.execute(ciudadId);
      return res.status(200).json(compras);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const id = parseInt(req.params.id);
      const estado = await this.productoRepository.toggleEstado(id);
      return res.status(200).json({ estado });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = ProductoController;
