class ListarServicios {
  constructor(servicioRepository) {
    this.servicioRepository = servicioRepository;
  }

  async execute() {
    const servicios = await this.servicioRepository.findAll();
    return servicios.filter(s => s.estado === true);
  }
}

module.exports = ListarServicios;