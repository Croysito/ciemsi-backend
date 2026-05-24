class CrearDeudaDesdeCita {
  constructor(deudaRepository, tratamientoRepository) {
    this.deudaRepository = deudaRepository;
    this.tratamientoRepository = tratamientoRepository;
  }

  async execute(citaId) {
    const tratamientosAsignados = await this.tratamientoRepository.findAsignadosByCita(citaId);
    const creados = [];

    for (const ta of tratamientosAsignados) {
      // Skip if deuda already exists for this tratamiento_asignado
      const existente = await this.deudaRepository.findByTratamientoAsignado(ta.id);
      if (existente) continue;

      if (!ta.precio || ta.precio <= 0) continue;

      const deudaId = await this.deudaRepository.create({
        pacienteId: ta.cita.paciente?.id || ta.cita.pacienteId,
        tratamientoAsignadoId: ta.id,
        montoOriginal: ta.precio,
        montoPendiente: ta.precio,
        estado: 'pendiente',
      });
      creados.push(deudaId);
    }

    return creados;
  }
}

module.exports = CrearDeudaDesdeCita;
