class HistorialClinico {
  constructor({ id, fecha, pacienteId, notas }) {
    this.id = id;
    this.fecha = fecha;
    this.pacienteId = pacienteId;
    this.notas = notas || []; // array de NotasEvolucion
  }
}

module.exports = HistorialClinico;