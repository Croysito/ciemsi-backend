class ListarTraslados {
  constructor(trasladoRepository) {
    this.trasladoRepository = trasladoRepository;
  }

  async execute(ciudadId) {
    if (!ciudadId) throw new Error('Ciudad requerida');
    return this.trasladoRepository.findByCiudad(ciudadId);
  }
}

module.exports = ListarTraslados;
