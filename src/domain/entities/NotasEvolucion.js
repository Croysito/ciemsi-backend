class NotasEvolucion {
  constructor({ id, fecha, detalle, historialId, links }) {
    this.id = id;
    this.fecha = fecha;
    this.detalle = detalle;
    this.historialId = historialId;
    this.links = links || []; // array de Links
  }
}

module.exports = NotasEvolucion;