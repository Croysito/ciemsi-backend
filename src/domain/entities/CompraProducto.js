class CompraProducto {
  constructor({ id, ciudad, fecha, proveedor, notas, items, createdBy, createdAt }) {
    this.id = id;
    this.ciudad = ciudad;
    this.fecha = fecha;
    this.proveedor = proveedor || null;
    this.notas = notas || null;
    this.items = items || [];
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}

module.exports = CompraProducto;
