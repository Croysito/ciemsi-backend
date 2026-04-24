class ModificarServicio {
  constructor(servicioRepository) {
    this.servicioRepository = servicioRepository;
  }

  async execute(id, { nombreServicio, tiempoMin, estado }) {
    const servicio = await this.servicioRepository.findById(id);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    await this.servicioRepository.update(id, {
      nombreServicio: nombreServicio || servicio.nombreServicio,
      tiempoMin: tiempoMin || servicio.tiempoMin,
      estado: estado !== undefined ? estado : servicio.estado,
    });
    return { mensaje: 'Servicio actualizado correctamente' };
  }
}

module.exports = ModificarServicio;