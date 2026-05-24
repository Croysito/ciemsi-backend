class ModificarProducto {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(id, { nombre, descripcion, unidadMedida, precioVenta, umbral, estado }) {
    const producto = await this.productoRepository.findById(id);
    if (!producto) throw new Error('Producto no encontrado');
    await this.productoRepository.update(id, {
      nombre: nombre ?? producto.nombre,
      descripcion: descripcion ?? producto.descripcion,
      unidadMedida: unidadMedida ?? producto.unidadMedida,
      precioVenta: precioVenta ?? producto.precioVenta,
      umbral: umbral ?? producto.umbral,
      estado: estado ?? producto.estado,
    });
    return this.productoRepository.findById(id);
  }
}

module.exports = ModificarProducto;
