class IniciarSesion {
  constructor(usuarioRepository, hashService, tokenService, asistentePermisoRepository) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.asistentePermisoRepository = asistentePermisoRepository;
  }

  async execute({ email, password }) {
    // 1. Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }

    // 2. Verificar que el usuario está activo
    if (!usuario.estado) {
      throw new Error('Usuario inactivo, contacte al administrador');
    }

    // 3. Verificar la contraseña
    const passwordValida = await this.hashService.comparar(password, usuario.password);
    if (!passwordValida) {
      throw new Error('Credenciales incorrectas');
    }

    // 4. Generar el token JWT
   const token = this.tokenService.generarToken({
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol.nombreRol,
    ciudadId: usuario.ciudad ? usuario.ciudad.id : null,
    ciudadNombre: usuario.ciudad ? usuario.ciudad.nombreCiudad : null,
  });

let permisos;
    if (usuario.rol.nombreRol === 'Asistente') {
      permisos = await this.asistentePermisoRepository.findByUsuarioId(usuario.id);
    }

return {
  token,
  usuario: {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    rol: usuario.rol.nombreRol,
    ciudad: usuario.ciudad ? {
      id: usuario.ciudad.id,
      nombreCiudad: usuario.ciudad.nombreCiudad,
    } : null,
    ...(permisos ? { permisos } : {}),
  },
};
  }
}

module.exports = IniciarSesion;
