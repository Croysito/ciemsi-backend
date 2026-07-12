class Paciente {
  constructor({ id, ci, telefono, fechaNacimiento, genero, usuario }) {
    this.id = id;
    this.ci = ci;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.genero = genero ?? null;
    this.usuario = usuario;
  }

  get nombreCompleto() {
    return `${this.usuario.nombre} ${this.usuario.apellido}`;
  }

  get ciudad() {
    return this.usuario.ciudad;
  }

  get edad() {
    if (!this.fechaNacimiento) return null;
    const hoy = new Date();
    const nac = new Date(this.fechaNacimiento);
    let años = hoy.getFullYear() - nac.getFullYear();
    const diffMes = hoy.getMonth() - nac.getMonth();
    if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < nac.getDate())) años--;
    return años;
  }

  toJSON() {
    return {
      id: this.id,
      ci: this.ci,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      edad: this.edad,
      usuario: this.usuario,
    };
  }
}

module.exports = Paciente;