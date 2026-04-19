class Link {
  constructor({ id, nombre, link, tipo, notaId }) {
    this.id = id;
    this.nombre = nombre;
    this.link = link;
    this.tipo = tipo; // 'IMAGEN' | 'VIDEO' | 'DRIVE'
    this.notaId = notaId;
  }
}

module.exports = Link;