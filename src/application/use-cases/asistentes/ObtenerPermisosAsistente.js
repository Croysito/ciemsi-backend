class ObtenerPermisosAsistente {
  constructor(usuarioRepository, asistentePermisoRepository) {
    this.usuarioRepository = usuarioRepository;
    this.asistentePermisoRepository = asistentePermisoRepository;
  }

  async execute(usuarioId) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Asistente no encontrado');
    }

    return this.asistentePermisoRepository.findByUsuarioId(usuarioId);
  }
}

module.exports = ObtenerPermisosAsistente;
