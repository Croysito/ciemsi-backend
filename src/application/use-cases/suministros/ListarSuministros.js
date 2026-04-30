class ListarSuministros {
  constructor(suministroRepository) {
    this.suministroRepository = suministroRepository;
  }

  async execute(tipo) {
    if (tipo) {
      return await this.suministroRepository.findByTipo(tipo);
    }
    return await this.suministroRepository.findAll();
  }
}

module.exports = ListarSuministros;