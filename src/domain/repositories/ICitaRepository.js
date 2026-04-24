class ICitaRepository {
  async findAll() {
    throw new Error('Método findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async findByCiudad(ciudadId) {
    throw new Error('Método findByCiudad() no implementado');
  }

  async findByPaciente(pacienteId) {
    throw new Error('Método findByPaciente() no implementado');
  }

  async findByFechaYCiudad(fecha, ciudadId) {
    throw new Error('Método findByFechaYCiudad() no implementado');
  }

  async create(cita) {
    throw new Error('Método create() no implementado');
  }

  async updateEstado(id, estado, notas) {
    throw new Error('Método updateEstado() no implementado');
  }

  async update(id, cita) {
    throw new Error('Método update() no implementado');
  }
}

module.exports = ICitaRepository;