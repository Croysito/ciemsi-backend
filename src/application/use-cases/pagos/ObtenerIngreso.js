class ObtenerIngreso {
  constructor(ingresoRepository) {
    this.ingresoRepository = ingresoRepository;
  }

  async execute(id) {
    const ingreso = await this.ingresoRepository.findById(id);
    if (!ingreso) throw new Error('Ingreso no encontrado');
    return ingreso;
  }
}

module.exports = ObtenerIngreso;
