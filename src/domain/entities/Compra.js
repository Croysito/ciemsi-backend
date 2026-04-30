class Compra {
  constructor({ id, fecha, ciudad, usuario, items }) {
    this.id = id;
    this.fecha = fecha;
    this.ciudad = ciudad;
    this.usuario = usuario;
    this.items = items || []; // array de CompraSupministro
  }
}

module.exports = Compra;