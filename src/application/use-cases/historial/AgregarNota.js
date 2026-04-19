class AgregarNota {
  constructor(historialRepository) {
    this.historialRepository = historialRepository;
  }

  async execute({ pacienteId, detalle }) {
    // 1. Obtener el historial del paciente
    const historial = await this.historialRepository.findByPacienteId(pacienteId);
    if (!historial) {
      throw new Error('Historial no encontrado');
    }

    // 2. Agregar la nota
    const nota = await this.historialRepository.addNota({
      fecha: new Date(),
      detalle,
      historialId: historial.id,
    });

    return { mensaje: 'Nota agregada correctamente', nota };
  }
}

module.exports = AgregarNota;