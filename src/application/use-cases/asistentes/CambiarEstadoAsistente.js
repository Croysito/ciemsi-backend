class CambiarEstadoAsistente {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id, estado) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Asistente no encontrado');
    }

    await this.usuarioRepository.updateEstado(id, estado);

    return {
      mensaje: `Asistente ${estado ? 'activado' : 'desactivado'} correctamente`
    };
  }
}

module.exports = CambiarEstadoAsistente;