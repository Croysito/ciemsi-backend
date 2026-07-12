class ObtenerHistorialMovimientos {
  constructor(cuentaRepository) {
    this.repo = cuentaRepository;
  }

  async execute({ ciudadId, fechaDesde, fechaHasta, tipo }) {
    if (!ciudadId) throw new Error('ciudadId es requerido');
    return this.repo.obtenerHistorial({
      ciudadId: parseInt(ciudadId),
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      tipo: tipo || null,
    });
  }
}

module.exports = ObtenerHistorialMovimientos;
