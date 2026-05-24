class Ingreso {
  constructor({ id, paciente, ciudad, tipo, deuda, monto, metodo, notas, items, fecha, createdAt, createdBy }) {
    this.id = id;
    this.paciente = paciente;
    this.ciudad = ciudad;
    this.tipo = tipo; // 'cobro_deuda' | 'venta_producto'
    this.deuda = deuda || null; // populated only for cobro_deuda
    this.monto = monto;
    this.metodo = metodo;
    this.notas = notas || null;
    this.items = items || []; // populated only for venta_producto
    this.fecha = fecha;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }
}

module.exports = Ingreso;
