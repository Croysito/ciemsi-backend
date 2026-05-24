class IProductoRepository {
  async findAll() { throw new Error('Método findAll() no implementado'); }
  async findById(id) { throw new Error('Método findById() no implementado'); }
  async create(producto) { throw new Error('Método create() no implementado'); }
  async update(id, producto) { throw new Error('Método update() no implementado'); }
  async getInventario(ciudadId) { throw new Error('Método getInventario() no implementado'); }
  async createCompra(compra) { throw new Error('Método createCompra() no implementado'); }
  async addCompraItem(item) { throw new Error('Método addCompraItem() no implementado'); }
}

module.exports = IProductoRepository;
