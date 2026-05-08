class CrearAgenda {
  constructor(agendaRepository, ciudadRepository) {
    this.agendaRepository = agendaRepository;
    this.ciudadRepository = ciudadRepository;
  }

  async execute({ fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId, usuarioId, rolUsuario, ciudadIdUsuario }) {
    // 1. Validar que tenga fecha O diasSemana pero no ambos
    if (!fecha && (!diasSemana || diasSemana.length === 0)) {
      throw new Error('Debe especificar una fecha o días de semana');
    }
    if (fecha && diasSemana && diasSemana.length > 0) {
      throw new Error('No puede especificar fecha y días de semana al mismo tiempo');
    }

    // 2. Validar horarios
    if (horaInicio >= horaFin) {
      throw new Error('La hora de inicio debe ser menor a la hora de fin');
    }

    // 3. Asistente solo puede crear agenda para su propia ciudad
    if (rolUsuario === 'Asistente' && parseInt(ciudadId) !== parseInt(ciudadIdUsuario)) {
      throw new Error('No autorizado: solo puedes crear agenda para tu ciudad');
    }

    // 4. Verificar ciudad
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 5. Crear agenda con usuario responsable
    const id = await this.agendaRepository.create({
      fecha: fecha || null,
      diasSemana: diasSemana || null,
      horaInicio,
      horaFin,
      intervalo: intervalo || 30,
      ciudadId,
      usuarioId,
    });

    return { mensaje: 'Agenda creada correctamente', id };
  }
}

module.exports = CrearAgenda;