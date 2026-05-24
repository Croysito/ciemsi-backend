class RegistrarVentaProducto {
  constructor(ingresoRepository, productoRepository) {
    this.ingresoRepository = ingresoRepository;
    this.productoRepository = productoRepository;
  }

  async execute({ pacienteId, ciudadId, items, metodo, notas, createdBy }) {
    if (!pacienteId || !ciudadId || !items || items.length === 0) {
      throw new Error('Paciente, ciudad e ítems son requeridos');
    }
    if (!['efectivo', 'qr'].includes(metodo)) {
      throw new Error('Método de pago no válido');
    }

    const montoTotal = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

    const ingresoId = await this.ingresoRepository.createVentaProducto({
      pacienteId,
      ciudadId,
      monto: montoTotal,
      metodo,
      notas: notas || null,
      createdBy,
    });

    for (const item of items) {
      await this.ingresoRepository.addProductoItem({
        ingresoId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      });
    }

    const ingreso = await this.ingresoRepository.findById(ingresoId);
    return { mensaje: 'Venta registrada correctamente', ingreso };
  }
}

module.exports = RegistrarVentaProducto;
