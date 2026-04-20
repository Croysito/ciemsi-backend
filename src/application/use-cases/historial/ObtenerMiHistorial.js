class ObtenerMiHistorial {
  constructor(historialRepository, pacienteRepository) {
    this.historialRepository = historialRepository;
    this.pacienteRepository = pacienteRepository;
  }

  async execute(usuarioId) {
    const id = parseInt(usuarioId);
    if (isNaN(id)) {
      throw new Error('ID de usuario no válido');
    }

    // 1. Buscar el paciente por usuario_id
    const pacienteEncontrado = await this.pacienteRepository.findByUsuarioId(id);
    if (!pacienteEncontrado) {
      throw new Error('No se encontró un paciente asociado a este usuario');
    }

    // 2. Obtener su historial
    const historial = await this.historialRepository.findByPacienteId(pacienteEncontrado.id);
    if (!historial) {
      throw new Error('Historial no encontrado');
    }

    // 3. Obtener notas con sus links
    const notas = await this.historialRepository.getNotas(historial.id);
    const notasConLinks = await Promise.all(
      notas.map(async nota => {
        const links = await this.historialRepository.getLinksByNota(nota.id);
        const soloMultimedia = links.filter(l =>
          l.tipo === 'IMAGEN' || l.tipo === 'VIDEO'
        );
        return { ...nota, links: soloMultimedia };
      })
    );

    return {
      paciente: {
        id: pacienteEncontrado.id,
        nombreCompleto: pacienteEncontrado.nombreCompleto,
        ci: pacienteEncontrado.ci,
      },
      historial: { ...historial, notas: notasConLinks }
    };
  }
}

module.exports = ObtenerMiHistorial;