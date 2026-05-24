class IngresoItem {
  constructor({ id, ingresoId, tipo, referenciaId, descripcion, cantidad, precioUnitario, subtotal }) {
    this.id = id;
    this.ingresoId = ingresoId;
    this.tipo = tipo; // 'tratamiento' | 'producto' | 'otro'
    this.referenciaId = referenciaId || null;
    this.descripcion = descripcion;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal;
  }
}

module.exports = IngresoItem;
