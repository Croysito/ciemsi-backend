const MODULOS_ASISTENTE = require('../../../domain/constants/ModulosAsistente');

class ActualizarPermisosAsistente {
  constructor(usuarioRepository, asistentePermisoRepository) {
    this.usuarioRepository = usuarioRepository;
    this.asistentePermisoRepository = asistentePermisoRepository;
  }

  async execute(usuarioId, permisos) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Asistente no encontrado');
    }

    const permisosValidos = {};
    for (const modulo of MODULOS_ASISTENTE) {
      if (modulo in permisos) {
        permisosValidos[modulo] = !!permisos[modulo];
      }
    }

    await this.asistentePermisoRepository.guardar(usuarioId, permisosValidos);
    return this.asistentePermisoRepository.findByUsuarioId(usuarioId);
  }
}

module.exports = ActualizarPermisosAsistente;
