class Tratamiento {
  constructor({ id, nombreTratamiento, detalle, precioBase }) {
    this.id = id;
    this.nombreTratamiento = nombreTratamiento;
    this.detalle = detalle;
    this.precioBase = precioBase;
  }
}

module.exports = Tratamiento;
