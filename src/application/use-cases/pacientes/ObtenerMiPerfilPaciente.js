class ObtenerMiPerfilPaciente {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository;
  }

  async execute(usuarioId) {
    const paciente = await this.pacienteRepository.findByUsuarioId(usuarioId);
    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  }
}

module.exports = ObtenerMiPerfilPaciente;
