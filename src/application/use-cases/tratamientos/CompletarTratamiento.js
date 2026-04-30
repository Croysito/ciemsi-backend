class CompletarTratamiento {
  constructor(tratamientoRepository, notificacionService) {
    this.tratamientoRepository = tratamientoRepository;
    this.notificacionService = notificacionService;
  }

  async execute(tratamientoAsignadoId) {
    const tratamientoAsignado = await this.tratamientoRepository
      .findAsignadoById(tratamientoAsignadoId);
    if (!tratamientoAsignado) throw new Error('Tratamiento asignado no encontrado');

    if (tratamientoAsignado.estado === 'COMPLETADO') {
      throw new Error('El tratamiento ya está completado');
    }

    // Completar y descontar inventario automáticamente
    await this.tratamientoRepository.completarTratamiento(tratamientoAsignadoId);

    // Notificar a la Doctora
    if (this.notificacionService) {
      await this.notificacionService.tratamientoCompletado(tratamientoAsignado);
    }

    return { mensaje: 'Tratamiento completado e inventario actualizado' };
  }
}

module.exports = CompletarTratamiento;