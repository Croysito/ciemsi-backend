class CrearServicio {
  constructor(servicioRepository) {
    this.servicioRepository = servicioRepository;
  }

  async execute({ nombreServicio, tiempoMin }) {
    if (!nombreServicio) {
      throw new Error('El nombre del servicio es requerido');
    }
    const id = await this.servicioRepository.create({
      nombreServicio,
      tiempoMin: tiempoMin || 30,
    });
    return { mensaje: 'Servicio creado correctamente', id };
  }
}

module.exports = CrearServicio;