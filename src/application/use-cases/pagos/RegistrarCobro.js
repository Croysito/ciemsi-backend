class RegistrarCobro {
  constructor(ingresoRepository, deudaRepository) {
    this.ingresoRepository = ingresoRepository;
    this.deudaRepository = deudaRepository;
  }

  async execute({ ingresoId, monto, metodo, notas, fechaLimite, createdBy }) {
    if (!ingresoId || !monto || !metodo) {
      throw new Error('Ingreso, monto y método son requeridos');
    }

    const METODOS_VALIDOS = ['efectivo', 'qr'];
    if (!METODOS_VALIDOS.includes(metodo)) {
      throw new Error('Método de pago no válido');
    }

    const ingreso = await this.ingresoRepository.findById(ingresoId);
    if (!ingreso) throw new Error('Ingreso no encontrado');

    await this.ingresoRepository.addCobro({
      ingresoId,
      monto: Number(monto),
      metodo,
      notas: notas || null,
      createdBy,
    });

    const totalCobrado = await this.ingresoRepository.getTotalCobrado(ingresoId);
    const saldoPendiente = Number(ingreso.montoTotal) - totalCobrado;

    const deudaExistente = await this.deudaRepository.findByIngreso(ingresoId);

    if (saldoPendiente > 0) {
      if (deudaExistente) {
        await this.deudaRepository.updateMontoPendiente(deudaExistente.id, saldoPendiente, 'pendiente');
      } else {
        await this.deudaRepository.create({
          pacienteId: ingreso.paciente.id,
          ingresoId,
          montoPendiente: saldoPendiente,
          estado: 'pendiente',
          fechaLimite: fechaLimite || null,
        });
      }
    } else if (deudaExistente) {
      await this.deudaRepository.updateMontoPendiente(deudaExistente.id, 0, 'pagada');
    }

    const ingresoActualizado = await this.ingresoRepository.findById(ingresoId);
    return {
      mensaje: 'Cobro registrado correctamente',
      ingreso: ingresoActualizado,
      saldoPendiente: Math.max(saldoPendiente, 0),
    };
  }
}

module.exports = RegistrarCobro;
