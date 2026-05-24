class Cobro {
  constructor({ id, ingresoId, monto, metodo, fecha, notas, createdBy }) {
    this.id = id;
    this.ingresoId = ingresoId;
    this.monto = monto;
    this.metodo = metodo; // 'efectivo' | 'qr'
    this.fecha = fecha;
    this.notas = notas || null;
    this.createdBy = createdBy;
  }
}

module.exports = Cobro;
