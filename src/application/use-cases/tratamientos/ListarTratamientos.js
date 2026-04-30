class ListarTratamientos {
  constructor(tratamientoRepository) {
    this.tratamientoRepository = tratamientoRepository;
  }

  async execute() {
    return await this.tratamientoRepository.findAll();
  }
}

module.exports = ListarTratamientos;