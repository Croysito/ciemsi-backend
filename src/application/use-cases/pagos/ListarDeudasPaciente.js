class ListarDeudasPaciente {
  constructor(deudaRepository) {
    this.deudaRepository = deudaRepository;
  }

  async execute(pacienteId) {
    if (!pacienteId) throw new Error('pacienteId es requerido');
    return this.deudaRepository.findByPaciente(pacienteId);
  }
}

module.exports = ListarDeudasPaciente;
