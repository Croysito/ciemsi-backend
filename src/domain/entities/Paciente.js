class Paciente {
  constructor({ id, ci, edad, telefono, fechaNacimiento, usuario }) {
    this.id = id;
    this.ci = ci;
    this.edad = edad;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.usuario = usuario;
  }

  get nombreCompleto() {
    return `${this.usuario.nombre} ${this.usuario.apellido}`;
  }

  get ciudad() {
    return this.usuario.ciudad;
  }
}

module.exports = Paciente;