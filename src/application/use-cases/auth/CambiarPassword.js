class CambiarPassword {
  constructor(usuarioRepository, hashService) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
  }

  async execute({ usuarioId, passwordActual, passwordNuevo }) {
    // 1. Obtener usuario
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Verificar password actual
    const passwordValida = await this.hashService.comparar(passwordActual, usuario.password);
    if (!passwordValida) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // 3. Hashear nueva password
    const hashedPassword = await this.hashService.hashear(passwordNuevo);

    // 4. Actualizar
    await this.usuarioRepository.updatePassword(usuarioId, hashedPassword);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}

module.exports = CambiarPassword;
