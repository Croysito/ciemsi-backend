class CrearTratamiento {
  constructor(tratamientoRepository, suministroRepository) {
    this.tratamientoRepository = tratamientoRepository;
    this.suministroRepository = suministroRepository;
  }

  async execute({ nombreTratamiento, detalle, precioBase, medicamentosBase }) {
    if (!nombreTratamiento) {
      throw new Error('El nombre del tratamiento es requerido');
    }

    const id = await this.tratamientoRepository.create({
      nombreTratamiento, detalle, precioBase,
    });

    if (Array.isArray(medicamentosBase) && medicamentosBase.length > 0) {
      for (const med of medicamentosBase) {
        if (!med.suministroId || !med.cantidad) {
          throw new Error('Cada medicamento base requiere suministroId y cantidad');
        }
        const suministro = await this.suministroRepository.findById(med.suministroId);
        if (!suministro) {
          throw new Error(`Suministro ${med.suministroId} no encontrado`);
        }
        if (suministro.tipo !== 'MEDICAMENTO') {
          throw new Error(`El suministro ${suministro.nombreSuministro} no es un MEDICAMENTO`);
        }
        await this.tratamientoRepository.addMedicamentoBase({
          tratamientoId: id,
          suministroId: med.suministroId,
          cantidad: med.cantidad,
        });
      }
    }

    return { mensaje: 'Tratamiento creado correctamente', id };
  }
}

module.exports = CrearTratamiento;