class Usuario {
  constructor({ id, nombre, email, password, rol, estado }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;       // objeto Rol
    this.estado = estado;
  }
}

module.exports = Usuario;