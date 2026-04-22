class Usuario {
  constructor({ id, nombre, apellido, email, password, rol, estado, ciudad }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password = password;
    this.rol = rol;
    this.estado = estado;
    this.ciudad = ciudad || null; // null para Doctora
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }
}

module.exports = Usuario;