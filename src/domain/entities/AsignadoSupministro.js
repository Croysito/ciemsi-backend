class AsignadoSupministro {
  constructor({ id, tratamientoAsignadoId, suministro, cantidad, agregadoPor }) {
    this.id = id;
    this.tratamientoAsignadoId = tratamientoAsignadoId;
    this.suministro = suministro;
    this.cantidad = cantidad;
    this.agregadoPor = agregadoPor; // DOCTORA | ASISTENTE
  }
}

module.exports = AsignadoSupministro;