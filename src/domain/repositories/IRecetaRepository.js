class IRecetaRepository {
  async findByCita(citaId) {
    throw new Error('Método findByCita() no implementado');
  }

  async create(receta) {
    throw new Error('Método create() no implementado');
  }

  async updateUrlPdf(id, urlPdf) {
    throw new Error('Método updateUrlPdf() no implementado');
  }
}

module.exports = IRecetaRepository;