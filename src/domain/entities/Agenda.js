class Agenda {
  constructor({ id, fecha, diasSemana, horaInicio, horaFin, intervalo, ciudad, estado, usuario }) {
    this.id = id;
    this.fecha = fecha || null;
    this.diasSemana = diasSemana || null;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.intervalo = intervalo || 30;
    this.ciudad = ciudad;
    this.estado = estado;
    this.usuario = usuario || null;
  }
}

module.exports = Agenda;