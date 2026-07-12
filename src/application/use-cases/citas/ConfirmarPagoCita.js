class ConfirmarPagoCita {
  constructor(citaRepository, ingresoRepository, configClinicaRepository) {
    this.citaRepository          = citaRepository;
    this.ingresoRepository       = ingresoRepository;
    this.configClinicaRepository = configClinicaRepository;
  }

  async execute(citaId, usuarioId) {
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) throw new Error('Cita no encontrada');

    if (cita.estado !== 'PENDIENTE_PAGO') {
      throw new Error('Solo se puede confirmar el pago de citas en estado PENDIENTE_PAGO');
    }

    const config = await this.configClinicaRepository.findConfig();
    const monto  = config.adelanto_monto || 50;

    // Registrar ingreso por adelanto (método QR, ya que el paciente pagó por transferencia)
    await this.ingresoRepository.createAdelantoCita({
      pacienteId: cita.paciente.id,
      ciudadId:   cita.ciudad.id,
      monto,
      metodo:     'qr',
      citaId,
      createdBy:  usuarioId,
    });

    // Guardar adelanto en la cita y cambiar estado
    await this.citaRepository.updateAdelanto(citaId, { monto, metodo: 'qr' });
    await this.citaRepository.updateEstado(citaId, 'CONFIRMADA', null);

    return { mensaje: 'Pago confirmado y cita confirmada correctamente' };
  }
}

module.exports = ConfirmarPagoCita;
