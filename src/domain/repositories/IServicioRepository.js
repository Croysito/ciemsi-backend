class IServicioRepository {
  async findAll() {
    throw new Error('Método findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async create({ nombreServicio, tiempoMin }) {
    throw new Error('Método create() no implementado');
  }

  async update(id, { nombreServicio, tiempoMin, estado }) {
    throw new Error('Método update() no implementado');
  }
}

module.exports = IServicioRepository;