class CitaMedica {
  constructor({ id, fecha, hora, paciente, servicio, ciudad, estado, notas, creadoPor, createdAt }) {
    this.id = id;
    this.fecha = fecha;
    this.hora = hora;
    this.paciente = paciente;
    this.servicio = servicio;
    this.ciudad = ciudad;
    this.estado = estado;
    this.notas = notas || null;
    this.creadoPor = creadoPor;
    this.createdAt = createdAt;
  }
}

module.exports = CitaMedica;