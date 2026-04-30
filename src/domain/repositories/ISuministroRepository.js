class ISuministroRepository {
  async findAll() {
    throw new Error('Método findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async findByTipo(tipo) {
    throw new Error('Método findByTipo() no implementado');
  }

  async create(suministro) {
    throw new Error('Método create() no implementado');
  }

  async update(id, suministro) {
    throw new Error('Método update() no implementado');
  }

  async getInventario(ciudadId) {
    throw new Error('Método getInventario() no implementado');
  }

  async getStockBajo(ciudadId) {
    throw new Error('Método getStockBajo() no implementado');
  }

  async getProximosAVencer(dias) {
    throw new Error('Método getProximosAVencer() no implementado');
  }
}

module.exports = ISuministroRepository;