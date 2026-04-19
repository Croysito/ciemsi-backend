class ObtenerHistorial {
  constructor(historialRepository) {
    this.historialRepository = historialRepository;
  }

  async execute(pacienteId) {
    // 1. Obtener el historial del paciente
    const historial = await this.historialRepository.findByPacienteId(pacienteId);
    if (!historial) {
      throw new Error('Historial no encontrado');
    }

    // 2. Obtener las notas del historial
    const notas = await this.historialRepository.getNotas(historial.id);

    // 3. Para cada nota obtener sus links
    const notasConLinks = await Promise.all(
      notas.map(async nota => {
        const links = await this.historialRepository.getLinksByNota(nota.id);
        return { ...nota, links };
      })
    );

    return { ...historial, notas: notasConLinks };
  }
}

module.exports = ObtenerHistorial;