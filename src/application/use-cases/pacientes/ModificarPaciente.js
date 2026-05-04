class ModificarPaciente {
  constructor(pacienteRepository, ciudadRepository, usuarioRepository) {
    this.pacienteRepository = pacienteRepository;
    this.ciudadRepository = ciudadRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id, { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId }) {
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

    // 3. Verificar CI duplicado si cambió
    if (ci !== paciente.ci) {
      const pacienteConCi = await this.pacienteRepository.findByCi(ci);
      if (pacienteConCi) {
        throw new Error('Ya existe un paciente con ese CI');
      }
    }

    if (email && email !== paciente.usuario.email) {
      const usuarioConEmail = await this.usuarioRepository.findByEmail(email);
      if (usuarioConEmail) {
        throw new Error('Ya existe un usuario con ese email');
      }
    }

    // 4. Actualizar paciente
    await this.pacienteRepository.update(id, {
      ci,
      nombre,
      apellido,
      email,
      edad,
      telefono,
      fechaNacimiento,
      ciudadId,
    });

    return { mensaje: 'Paciente actualizado correctamente' };
  }
}

module.exports = ModificarPaciente;
