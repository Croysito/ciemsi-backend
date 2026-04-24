class ObtenerDisponibilidad {
  constructor(agendaRepository, citaRepository) {
    this.agendaRepository = agendaRepository;
    this.citaRepository = citaRepository;
  }

  async execute(ciudadId, fecha) {
    // 1. Obtener agendas disponibles para esa fecha y ciudad
    const agendas = await this.agendaRepository.findDisponibilidad(ciudadId, fecha);
    if (agendas.length === 0) {
      return { fecha, ciudad: ciudadId, horasDisponibles: [] };
    }

    // 2. Obtener citas ya reservadas para esa fecha y ciudad
    const citasReservadas = await this.citaRepository.findByFechaYCiudad(fecha, ciudadId);
    const horasOcupadas = citasReservadas
      .filter(c => c.estado !== 'CANCELADA')
      .map(c => c.hora);

    // 3. Generar slots de tiempo disponibles
    const horasDisponibles = [];
    for (const agenda of agendas) {
      const slots = this._generarSlots(
        agenda.horaInicio,
        agenda.horaFin,
        agenda.intervalo,
        horasOcupadas
      );
      horasDisponibles.push(...slots);
    }

    return {
      fecha,
      ciudadId,
      horasDisponibles: [...new Set(horasDisponibles)].sort(),
    };
  }

  _generarSlots(horaInicio, horaFin, intervalo, horasOcupadas) {
    const slots = [];
    let [horas, minutos] = horaInicio.split(':').map(Number);
    const [horasFin, minutosFin] = horaFin.split(':').map(Number);
    const finEnMinutos = horasFin * 60 + minutosFin;

    while (horas * 60 + minutos < finEnMinutos) {
      const slot = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      if (!horasOcupadas.some(h => h.startsWith(slot))) {
        slots.push(slot);
      }
      minutos += intervalo;
      if (minutos >= 60) {
        horas += Math.floor(minutos / 60);
        minutos = minutos % 60;
      }
    }
    return slots;
  }
}

module.exports = ObtenerDisponibilidad;