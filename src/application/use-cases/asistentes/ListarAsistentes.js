class ListarAsistentes {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    return await this.usuarioRepository.findByRol(2); // rol Asistente
  }
}

module.exports = ListarAsistentes;