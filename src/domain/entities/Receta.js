class Receta {
  constructor({ id, cita, detalle, urlPdf, createdAt }) {
    this.id = id;
    this.cita = cita;
    this.detalle = detalle;
    this.urlPdf = urlPdf || null;
    this.createdAt = createdAt;
  }
}

module.exports = Receta;