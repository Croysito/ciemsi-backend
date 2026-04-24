class ModificarCita {
  constructor(citaRepository) {
    this.citaRepository = citaRepository;
  }

  async execute(id, { fecha, hora, servicioId, notas }) {
    // 1. Verificar que existe
    const cita = await this.citaRepository.findById(id);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // 2. Verificar que no esté cancelada o completada
    if (['CANCELADA', 'COMPLETADA'].includes(cita.estado)) {
      throw new Error('No se puede modificar una cita cancelada o completada');
    }

    // 3. Verificar disponibilidad del nuevo horario
    if (fecha !== cita.fecha || hora !== cita.hora) {
      const citasExistentes = await this.citaRepository.findByFechaYCiudad(
        fecha, cita.ciudad.id
      );
      const horaOcupada = citasExistentes
        .filter(c => c.id !== id && c.estado !== 'CANCELADA')
        .some(c => c.hora.startsWith(hora));

      if (horaOcupada) {
        throw new Error('Esa hora ya está ocupada');
      }
    }

    // 4. Modificar cita → estado pasa a MODIFICADA
    await this.citaRepository.update(id, { fecha, hora, servicioId, notas });

    return { mensaje: 'Cita modificada correctamente, esperando confirmación del paciente' };
  }
}

module.exports = ModificarCita;