class VerificarAlertas {
  constructor(suministroRepository) {
    this.suministroRepository = suministroRepository;
  }

  async execute(ciudadId) {
    const stockBajo = await this.suministroRepository.getStockBajo(ciudadId);
    const proximosAVencer = await this.suministroRepository.getProximosAVencer(30);
    return {
      stockBajo,
      proximosAVencer,
      totalAlertas: stockBajo.length + proximosAVencer.length,
    };
  }
}

module.exports = VerificarAlertas;