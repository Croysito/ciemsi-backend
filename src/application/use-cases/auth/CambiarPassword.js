const bcrypt = require('bcryptjs');

class CambiarPassword {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId, passwordActual, passwordNuevo }) {
    // 1. Obtener usuario
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Verificar password actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValida) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // 3. Hashear nueva password
    const hashedPassword = await bcrypt.hash(passwordNuevo, 10);

    // 4. Actualizar
    await this.usuarioRepository.updatePassword(usuarioId, hashedPassword);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}

module.exports = CambiarPassword;