class ListarMovimientosExtra {
  constructor(movimientoExtraRepository) {
    this.repo = movimientoExtraRepository;
  }

  async execute({ ciudadId, tipo, fechaDesde, fechaHasta }) {
    if (!ciudadId) throw new Error('ciudadId es requerido');
    return this.repo.findByCiudad({ ciudadId, tipo, fechaDesde, fechaHasta });
  }
}

module.exports = ListarMovimientosExtra;
