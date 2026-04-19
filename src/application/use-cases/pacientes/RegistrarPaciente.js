class RegistrarPaciente {
  constructor(pacienteRepository, historialRepository, ciudadRepository) {
    this.pacienteRepository = pacienteRepository;
    this.historialRepository = historialRepository;
    this.ciudadRepository = ciudadRepository;
  }

  async execute({ ci, nombre, edad, telefono, fechaNacimiento, ciudadId }) {
    // 1. Verificar que no exista un paciente con ese CI
    const pacienteExistente = await this.pacienteRepository.findByCi(ci);
    if (pacienteExistente) {
      throw new Error('Ya existe un paciente con ese CI');
    }

    // 2. Verificar que la ciudad existe
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 3. Registrar el paciente
    const pacienteId = await this.pacienteRepository.create({
      ci,
      nombre,
      edad,
      telefono,
      fechaNacimiento,
      ciudad,
    });

    // 4. Crear automáticamente su historial clínico
    await this.historialRepository.create(pacienteId);

    return { mensaje: 'Paciente registrado correctamente', pacienteId };
  }
}

module.exports = RegistrarPaciente;