class TratamientoAsignado {
  constructor({ id, tratamiento, cita, precio, estado, suministros, createdAt }) {
    this.id = id;
    this.tratamiento = tratamiento;
    this.cita = cita;
    this.precio = precio;
    this.estado = estado;
    this.suministros = suministros || [];
    this.createdAt = createdAt;
  }

  get ciudad() {
    return this.cita?.ciudad;
  }
}

module.exports = TratamientoAsignado;
