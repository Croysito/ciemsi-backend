class Paciente {
  constructor({ id, ci, edad, telefono, fechaNacimiento, ciudad, usuario }) {
    this.id = id;
    this.ci = ci;
    this.edad = edad;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.ciudad = ciudad;
    this.usuario = usuario; // objeto Usuario completo
  }

  get nombreCompleto() {
    return `${this.usuario.nombre} ${this.usuario.apellido}`;
  }
}

module.exports = Paciente;