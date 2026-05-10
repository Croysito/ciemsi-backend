class ListarPacientesPorUsuario {
  constructor(pacienteRepository) {
    this.pacienteRepository = pacienteRepository;
  }

  async execute({ rol, ciudadId }) {
    if (rol === 'Asistente' && ciudadId) {
      return this.pacienteRepository.findByCiudad(parseInt(ciudadId));
    }

    return this.pacienteRepository.findAll();
  }
}

module.exports = ListarPacientesPorUsuario;
