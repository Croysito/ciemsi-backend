class ObtenerLinksPorTipo {
  constructor(historialRepository) {
    this.historialRepository = historialRepository;
  }

  async execute({ notaId, tipo }) {
    const tiposValidos = ['IMAGEN', 'VIDEO', 'DRIVE'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo no válido. Use: IMAGEN, VIDEO o DRIVE');
    }

    const links = await this.historialRepository.getLinksByTipo(notaId, tipo);
    return links;
  }
}

module.exports = ObtenerLinksPorTipo;