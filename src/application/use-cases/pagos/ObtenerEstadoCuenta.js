class ObtenerEstadoCuenta {
  constructor(ingresoRepository, deudaRepository) {
    this.ingresoRepository = ingresoRepository;
    this.deudaRepository = deudaRepository;
  }

  async execute(pacienteId) {
    if (!pacienteId) throw new Error('pacienteId es requerido');

    const [ingresos, deudas] = await Promise.all([
      this.ingresoRepository.findByPaciente(pacienteId),
      this.deudaRepository.findByPaciente(pacienteId),
    ]);

    const totalDeuda = deudas.reduce((sum, d) => sum + Number(d.montoOriginal), 0);
    const totalCobrado = deudas.reduce((sum, d) => sum + (Number(d.montoOriginal) - Number(d.montoPendiente)), 0);
    const totalPendiente = deudas
      .filter(d => d.estado === 'pendiente')
      .reduce((sum, d) => sum + Number(d.montoPendiente), 0);

    return {
      deudas,
      ingresos,
      resumen: { totalDeuda, totalCobrado, totalPendiente },
    };
  }
}

module.exports = ObtenerEstadoCuenta;
