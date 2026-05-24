class RegistrarIngreso {
  constructor(ingresoRepository) {
    this.ingresoRepository = ingresoRepository;
  }

  async execute({ pacienteId, citaId, ciudadId, tipoOrigen, descripcion, items, createdBy }) {
    if (!pacienteId || !ciudadId || !items || items.length === 0) {
      throw new Error('Paciente, ciudad e items son requeridos');
    }

    const TIPOS_VALIDOS = ['primera_cita', 'cita', 'libre'];
    if (!TIPOS_VALIDOS.includes(tipoOrigen)) {
      throw new Error('Tipo de origen no válido');
    }

    const montoTotal = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

    const ingresoId = await this.ingresoRepository.create({
      pacienteId,
      citaId: citaId || null,
      ciudadId,
      tipoOrigen,
      descripcion: descripcion || null,
      montoTotal,
      createdBy,
    });

    for (const item of items) {
      await this.ingresoRepository.addItem({
        ingresoId,
        tipo: item.tipo,
        referenciaId: item.referenciaId || null,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      });
    }

    const ingreso = await this.ingresoRepository.findById(ingresoId);
    return { mensaje: 'Ingreso registrado correctamente', ingreso };
  }
}

module.exports = RegistrarIngreso;
