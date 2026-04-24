class CrearAgenda {
  constructor(agendaRepository, ciudadRepository) {
    this.agendaRepository = agendaRepository;
    this.ciudadRepository = ciudadRepository;
  }

  async execute({ fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId }) {
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

    // 3. Verificar ciudad
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 4. Crear agenda
    const id = await this.agendaRepository.create({
      fecha: fecha || null,
      diasSemana: diasSemana || null,
      horaInicio,
      horaFin,
      intervalo: intervalo || 30,
      ciudadId,
    });

    return { mensaje: 'Agenda creada correctamente', id };
  }
}

module.exports = CrearAgenda;