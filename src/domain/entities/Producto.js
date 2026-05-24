class Producto {
  constructor({ id, nombre, descripcion, unidadMedida, precioVenta, umbral, estado, createdAt }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion || null;
    this.unidadMedida = unidadMedida;
    this.precioVenta = precioVenta;
    this.umbral = umbral;
    this.estado = estado;
    this.createdAt = createdAt;
  }
}

module.exports = Producto;
