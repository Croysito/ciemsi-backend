class ListarIngresosPaciente {
  constructor(ingresoRepository) {
    this.ingresoRepository = ingresoRepository;
  }

  async execute(pacienteId) {
    if (!pacienteId) throw new Error('pacienteId es requerido');
    return this.ingresoRepository.findByPaciente(pacienteId);
  }
}

module.exports = ListarIngresosPaciente;
