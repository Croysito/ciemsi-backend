class CambiarEstadoTratamientoAsignado {
  constructor(tratamientoRepository) {
    this.tratamientoRepository = tratamientoRepository;
  }

  async execute(tratamientoAsignadoId, estado) {
    const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado no valido. Use: PENDIENTE, EN_PROCESO o COMPLETADO');
    }

    const tratamientoAsignado = await this.tratamientoRepository
      .findAsignadoById(tratamientoAsignadoId);
    if (!tratamientoAsignado) {
      throw new Error('Tratamiento asignado no encontrado');
    }

    await this.tratamientoRepository.updateEstadoAsignado(
      tratamientoAsignadoId,
      estado
    );

    return { mensaje: `Tratamiento asignado actualizado a ${estado}` };
  }
}

module.exports = CambiarEstadoTratamientoAsignado;
