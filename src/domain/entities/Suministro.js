class Suministro {
  constructor({ id, nombreSuministro, unidadMedida, marca, tipo, umbral, estado }) {
    this.id = id;
    this.nombreSuministro = nombreSuministro;
    this.unidadMedida = unidadMedida;
    this.marca = marca;
    this.tipo = tipo; // MEDICAMENTO | INSUMO | MATERIAL
    this.umbral = umbral;
    this.estado = estado;
  }
}

module.exports = Suministro;