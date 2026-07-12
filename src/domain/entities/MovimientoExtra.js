class MovimientoExtra {
  constructor({ id, tipo, categoria, descripcion, monto, metodo, ciudad, usuario, fecha }) {
    this.id = id;
    this.tipo = tipo;           // 'ingreso' | 'egreso'
    this.categoria = categoria;
    this.descripcion = descripcion || null;
    this.monto = monto;
    this.metodo = metodo;       // 'efectivo' | 'transferencia'
    this.ciudad = ciudad;       // { id, nombreCiudad }
    this.usuario = usuario;     // { id, nombre }
    this.fecha = fecha;
  }
}

module.exports = MovimientoExtra;
