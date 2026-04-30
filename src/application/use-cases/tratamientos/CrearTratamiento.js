class CrearTratamiento {
  constructor(tratamientoRepository) {
    this.tratamientoRepository = tratamientoRepository;
  }

  async execute({ nombreTratamiento, detalle, precioBase }) {
    if (!nombreTratamiento) {
      throw new Error('El nombre del tratamiento es requerido');
    }
    const id = await this.tratamientoRepository.create({
      nombreTratamiento, detalle, precioBase,
    });
    return { mensaje: 'Tratamiento creado correctamente', id };
  }
}

module.exports = CrearTratamiento;