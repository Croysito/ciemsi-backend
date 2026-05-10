class ListarCiudades {
  constructor(ciudadRepository) {
    this.ciudadRepository = ciudadRepository;
  }

  async execute() {
    return this.ciudadRepository.findAll();
  }
}

module.exports = ListarCiudades;
