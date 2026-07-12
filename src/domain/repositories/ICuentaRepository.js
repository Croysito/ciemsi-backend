class ICuentaRepository {
  async calcularResumen(ciudadId)                                     { throw new Error('No implementado'); }
  async obtenerHistorial({ ciudadId, fechaDesde, fechaHasta, tipo }) { throw new Error('No implementado'); }
}

module.exports = ICuentaRepository;
