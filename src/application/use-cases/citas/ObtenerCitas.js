class ObtenerCitas {
  constructor(citaRepository) {
    this.citaRepository = citaRepository;
  }

  async execute({ rol, ciudadId, pacienteId }) {
    if (rol === 'Paciente') {
      return await this.citaRepository.findByPaciente(pacienteId);
    } else if (rol === 'Asistente' && ciudadId) {
      return await this.citaRepository.findByCiudad(parseInt(ciudadId));
    } else {
      return await this.citaRepository.findAll();
    }
  }
}

module.exports = ObtenerCitas;