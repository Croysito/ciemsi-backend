class IAgendaRepository {
  async findByCiudad(ciudadId) {
    throw new Error('Método findByCiudad() no implementado');
  }

  async findDisponibilidad(ciudadId, fecha) {
    throw new Error('Método findDisponibilidad() no implementado');
  }

  async create(agenda) {
    throw new Error('Método create() no implementado');
  }

  async update(id, agenda) {
    throw new Error('Método update() no implementado');
  }

  async delete(id) {
    throw new Error('Método delete() no implementado');
  }
}

module.exports = IAgendaRepository;