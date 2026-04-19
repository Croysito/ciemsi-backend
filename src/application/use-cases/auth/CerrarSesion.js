class CerrarSesion {
  // En JWT la sesión se cierra en el cliente eliminando el token.
  // Este caso de uso existe para mantener consistencia con el diagrama
  // y para futuras implementaciones de blacklist de tokens.
  execute() {
    return { mensaje: 'Sesión cerrada correctamente' };
  }
}

module.exports = CerrarSesion;