class Tratamiento {
  constructor({ id, nombreTratamiento, detalle, precioBase, medicamentosBase }) {
    this.id = id;
    this.nombreTratamiento = nombreTratamiento;
    this.detalle = detalle;
    this.precioBase = precioBase;
    this.medicamentosBase = medicamentosBase || [];
  }
}

module.exports = Tratamiento;
