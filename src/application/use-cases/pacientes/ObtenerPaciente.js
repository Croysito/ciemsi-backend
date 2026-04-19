class ObtenerPaciente {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository;
  }

  async execute(id) {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }
    return paciente;
  }
}

module.exports = ObtenerPaciente;