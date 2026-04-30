class ICompraRepository {
  async findAll(ciudadId) {
    throw new Error('Método findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async create(compra) {
    throw new Error('Método create() no implementado');
  }

  async addItem(item) {
    throw new Error('Método addItem() no implementado');
  }
}

module.exports = ICompraRepository;