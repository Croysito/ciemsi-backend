class ListarPacientes {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository;
  }

  async execute() {
    const pacientes = await this.pacienteRepository.findAll();
    if (!pacientes.length) {
      return [];
    }
    return pacientes;
  }
}

module.exports = ListarPacientes;