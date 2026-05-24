class CrearProducto {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute({ nombre, descripcion, unidadMedida, precioVenta, umbral }) {
    if (!nombre || !unidadMedida) throw new Error('Nombre y unidad de medida son requeridos');
    const id = await this.productoRepository.create({ nombre, descripcion, unidadMedida, precioVenta: precioVenta || 0, umbral: umbral || 0 });
    return this.productoRepository.findById(id);
  }
}

module.exports = CrearProducto;
