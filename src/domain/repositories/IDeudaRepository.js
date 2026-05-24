class IDeudaRepository {
  async create(deuda) { throw new Error('Método create() no implementado'); }
  async findById(id) { throw new Error('Método findById() no implementado'); }
  async findByTratamientoAsignado(tratamientoAsignadoId) { throw new Error('Método findByTratamientoAsignado() no implementado'); }
  async findByPaciente(pacienteId) { throw new Error('Método findByPaciente() no implementado'); }
  async updateMontoPendiente(id, montoPendiente, estado) { throw new Error('Método updateMontoPendiente() no implementado'); }
}

module.exports = IDeudaRepository;
