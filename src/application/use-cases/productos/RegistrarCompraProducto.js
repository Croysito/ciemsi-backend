class RegistrarCompraProducto {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute({ fecha, ciudadId, usuarioId, items }) {
    if (!ciudadId || !items || items.length === 0) {
      throw new Error('Ciudad e ítems son requeridos');
    }
    const compraId = await this.productoRepository.createCompra({
      fecha: fecha || new Date(),
      ciudadId,
      usuarioId,
    });
    for (const item of items) {
      await this.productoRepository.addCompraItem({
        compraId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      });
    }
    return { mensaje: 'Compra registrada correctamente', compraId };
  }
}

module.exports = RegistrarCompraProducto;
