class ITratamientoRepository {
  async findAll() {
    throw new Error('Metodo findAll() no implementado');
  }

  async findById(id) {
    throw new Error('Metodo findById() no implementado');
  }

  async create(tratamiento) {
    throw new Error('Metodo create() no implementado');
  }

  async update(id, tratamiento) {
    throw new Error('Metodo update() no implementado');
  }

  async asignar(tratamientoAsignado) {
    throw new Error('Metodo asignar() no implementado');
  }

  async findAsignadoById(id) {
    throw new Error('Metodo findAsignadoById() no implementado');
  }

  async findAsignados() {
    throw new Error('Metodo findAsignados() no implementado');
  }

  async findAsignadosByCiudad(ciudadId) {
    throw new Error('Metodo findAsignadosByCiudad() no implementado');
  }

  async findAsignadosByPaciente(pacienteId) {
    throw new Error('Metodo findAsignadosByPaciente() no implementado');
  }

  async findAsignadosByCita(citaId) {
    throw new Error('Metodo findAsignadosByCita() no implementado');
  }

  async addSupministroAsignado(item) {
    throw new Error('Metodo addSupministroAsignado() no implementado');
  }

  async updateEstadoAsignado(id, estado) {
    throw new Error('Metodo updateEstadoAsignado() no implementado');
  }

  async completarTratamiento(id) {
    throw new Error('Metodo completarTratamiento() no implementado');
  }
}

module.exports = ITratamientoRepository;
