class ModificarPaciente {
  constructor(pacienteRepository, ciudadRepository) {
    this.pacienteRepository = pacienteRepository;
    this.ciudadRepository = ciudadRepository;
  }

  async execute(id, { ci, nombre, edad, telefono, fechaNacimiento, ciudadId }) {
    // 1. Verificar que el paciente existe
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    // 2. Verificar que la ciudad existe
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 3. Verificar CI duplicado (si cambió)
    if (ci !== paciente.ci) {
      const pacienteConCi = await this.pacienteRepository.findByCi(ci);
      if (pacienteConCi) {
        throw new Error('Ya existe un paciente con ese CI');
      }
    }

    // 4. Actualizar
    await this.pacienteRepository.update(id, {
      ci,
      nombre,
      edad,
      telefono,
      fechaNacimiento,
      ciudad,
    });

    return { mensaje: 'Paciente actualizado correctamente' };
  }
}

module.exports = ModificarPaciente;