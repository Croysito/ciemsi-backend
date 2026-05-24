class Deuda {
  constructor({ id, paciente, tratamientoAsignado, montoOriginal, montoPendiente, estado, fechaLimite, createdAt }) {
    this.id = id;
    this.paciente = paciente;
    this.tratamientoAsignado = tratamientoAsignado; // { id, nombre, precio }
    this.montoOriginal = montoOriginal;
    this.montoPendiente = montoPendiente;
    this.estado = estado; // 'pendiente' | 'pagada'
    this.fechaLimite = fechaLimite || null;
    this.createdAt = createdAt;
  }
}

module.exports = Deuda;
