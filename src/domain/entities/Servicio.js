class Servicio {
  constructor({ id, nombreServicio, tiempoMin, estado, roles = [] }) {
    this.id = id;
    this.nombreServicio = nombreServicio;
    this.tiempoMin = tiempoMin;
    this.estado = estado;
    this.roles = roles;
  }
}

module.exports = Servicio;