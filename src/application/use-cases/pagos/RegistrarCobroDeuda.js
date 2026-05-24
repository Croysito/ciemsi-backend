class RegistrarCobroDeuda {
  constructor(ingresoRepository, deudaRepository) {
    this.ingresoRepository = ingresoRepository;
    this.deudaRepository = deudaRepository;
  }

  async execute({ deudaId, pacienteId, ciudadId, monto, metodo, notas, createdBy }) {
    if (!deudaId || !monto || !metodo) {
      throw new Error('Deuda, monto y método son requeridos');
    }
    if (!['efectivo', 'qr'].includes(metodo)) {
      throw new Error('Método de pago no válido');
    }

    const deuda = await this.deudaRepository.findById(deudaId);
    if (!deuda) throw new Error('Deuda no encontrada');
    if (deuda.estado === 'pagada') throw new Error('La deuda ya está pagada');

    const montoCobrando = Math.min(Number(monto), deuda.montoPendiente);

    const ingresoId = await this.ingresoRepository.createCobroDeuda({
      pacienteId,
      ciudadId,
      deudaId,
      monto: montoCobrando,
      metodo,
      notas: notas || null,
      createdBy,
    });

    const nuevoPendiente = parseFloat((deuda.montoPendiente - montoCobrando).toFixed(2));
    const nuevoEstado = nuevoPendiente <= 0 ? 'pagada' : 'pendiente';
    await this.deudaRepository.updateMontoPendiente(deudaId, nuevoPendiente, nuevoEstado);

    const ingreso = await this.ingresoRepository.findById(ingresoId);
    const deudaActualizada = await this.deudaRepository.findById(deudaId);

    return { mensaje: 'Cobro registrado correctamente', ingreso, deuda: deudaActualizada };
  }
}

module.exports = RegistrarCobroDeuda;
