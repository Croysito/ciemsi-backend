class IHistorialRepository {
  async findByPacienteId(pacienteId) {
    throw new Error('Método findByPacienteId() no implementado');
  }

  async create(pacienteId) {
    throw new Error('Método create() no implementado');
  }

  async addNota(nota) {
    throw new Error('Método addNota() no implementado');
  }

  async getNotas(historialId) {
    throw new Error('Método getNotas() no implementado');
  }

  async addLink(link) {
    throw new Error('Método addLink() no implementado');
  }

  async getLinksByNota(notaId) {
    throw new Error('Método getLinksByNota() no implementado');
  }

  async getLinksByTipo(notaId, tipo) {
    throw new Error('Método getLinksByTipo() no implementado');
  }
}

module.exports = IHistorialRepository;