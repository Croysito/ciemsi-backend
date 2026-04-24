class Servicio {
  constructor({ id, nombreServicio, tiempoMin, estado }) {
    this.id = id;
    this.nombreServicio = nombreServicio;
    this.tiempoMin = tiempoMin;
    this.estado = estado;
  }
}

module.exports = Servicio;