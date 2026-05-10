class ReservarCita {
  constructor(citaRepository, agendaRepository, pacienteRepository) {
    this.citaRepository = citaRepository;
    this.agendaRepository = agendaRepository;
    this.pacienteRepository = pacienteRepository;
  }

  async execute({ fecha, hora, pacienteId, servicioId, ciudadId, agendaId, notas, creadoPor, rolCreador }) {
    // 1. Verificar que el servicio esté permitido para la agenda seleccionada
    let servicioValido;
    if (agendaId) {
      servicioValido = await this.agendaRepository.isServicioValidoParaAgendaById(
        agendaId, servicioId
      );
    } else {
      servicioValido = await this.agendaRepository.isServicioValidoParaAgenda(
        ciudadId, fecha, servicioId
      );
    }
    if (!servicioValido) {
      throw new Error('El servicio seleccionado no está disponible en esta agenda');
    }

    // 2. Verificar disponibilidad horaria
    const citasExistentes = await this.citaRepository.findByFechaYCiudad(fecha, ciudadId);
    const horaOcupada = citasExistentes
      .filter(c => c.estado !== 'CANCELADA')
      .some(c => c.hora.startsWith(hora));

    if (horaOcupada) {
      throw new Error('Esa hora ya está ocupada');
    }

    // 2. Determinar estado según quién reserva
    // Si la crea la Dra o Asistente queda CONFIRMADA directamente
    const estado = rolCreador === 'Paciente' ? 'PENDIENTE' : 'CONFIRMADA';

    // 3. Crear la cita
    const id = await this.citaRepository.create({
      fecha,
      hora,
      pacienteId,
      servicioId,
      ciudadId,
      notas,
      creadoPor,
    });

    // 4. Actualizar estado si es necesario
    if (estado === 'CONFIRMADA') {
      await this.citaRepository.updateEstado(id, 'CONFIRMADA', null);
    }

    return { mensaje: 'Cita reservada correctamente', citaId: id, estado };
  }
}

module.exports = ReservarCita;