class IPacienteRepository {
  async findAll() {
    throw new Error('Método findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async findByCi(ci) {
    throw new Error('Método findByCi() no implementado');
  }

  async create(paciente) {
    throw new Error('Método create() no implementado');
  }

  async update(id, paciente) {
    throw new Error('Método update() no implementado');
  }
  async findByUsuarioId(usuarioId) {
    throw new Error('Método findByUsuarioId() no implementado');
  }
}

module.exports = IPacienteRepository;