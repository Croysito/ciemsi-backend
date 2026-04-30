class CompraSupministro {
  constructor({ id, compraId, suministro, cantidad, precioUnitario, total, fechaVencimiento }) {
    this.id = id;
    this.compraId = compraId;
    this.suministro = suministro;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.total = total;
    this.fechaVencimiento = fechaVencimiento || null;
  }
}

module.exports = CompraSupministro;