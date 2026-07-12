class HistorialMovimiento {
  constructor({ id, tipo, categoria, descripcion, monto, metodo, fecha, fuente, ciudad }) {
    this.id = id;
    this.tipo = tipo;           // 'ingreso' | 'egreso'
    this.categoria = categoria; // label descriptivo
    this.descripcion = descripcion || null;
    this.monto = monto;
    this.metodo = metodo;       // 'efectivo' | 'qr' | 'transferencia'
    this.fecha = fecha;
    this.fuente = fuente;       // 'ingreso_paciente' | 'compra' | 'movimiento_extra' | 'traslado'
    this.ciudad = ciudad;
  }
}

module.exports = HistorialMovimiento;
