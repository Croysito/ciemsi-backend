class CambiarEstadoCita {
  constructor(citaRepository) {
    this.citaRepository = citaRepository;
  }

  async execute(id, estado, notas, rolSolicitante) {
    const cita = await this.citaRepository.findById(id);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Validar transiciones de estado permitidas
    const transicionesPermitidas = {
      'Doctora': {
        'PENDIENTE': ['CONFIRMADA', 'CANCELADA'],
        'MODIFICADA': ['CONFIRMADA', 'CANCELADA'],
        'CONFIRMADA': ['COMPLETADA', 'CANCELADA'],
      },
      'Asistente': {
        'PENDIENTE': ['CONFIRMADA', 'CANCELADA'],
        'MODIFICADA': ['CONFIRMADA', 'CANCELADA'],
        'CONFIRMADA': ['CANCELADA'],
      },
      'Paciente': {
        'MODIFICADA': ['CONFIRMADA', 'CANCELADA'],
        'CONFIRMADA': ['CANCELADA'],
        'PENDIENTE': ['CANCELADA'],
      },
    };

    const permitidos = transicionesPermitidas[rolSolicitante]?.[cita.estado] || [];
    if (!permitidos.includes(estado)) {
      throw new Error(
        `No puedes cambiar el estado de ${cita.estado} a ${estado}`
      );
    }

    await this.citaRepository.updateEstado(id, estado, notas);
    return { mensaje: `Cita ${estado.toLowerCase()} correctamente` };
  }
}

module.exports = CambiarEstadoCita;