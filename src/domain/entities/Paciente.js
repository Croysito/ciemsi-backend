class Paciente {
  constructor({ id, ci, nombre, edad, telefono, fechaNacimiento, ciudad }) {
    this.id = id;
    this.ci = ci;
    this.nombre = nombre;
    this.edad = edad;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.ciudad = ciudad; // objeto Ciudad
  }
}

module.exports = Paciente;