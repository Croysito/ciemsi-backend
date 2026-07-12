class RegistrarPaciente {
  constructor(pacienteRepository, historialRepository, ciudadRepository, usuarioRepository, hashService) {
    this.pacienteRepository = pacienteRepository;
    this.historialRepository = historialRepository;
    this.ciudadRepository = ciudadRepository;
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
  }

  async execute({ ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId }) {
    // 1. Verificar CI duplicado
    const pacienteExistente = await this.pacienteRepository.findByCi(ci);
    if (pacienteExistente) {
      throw new Error('Ya existe un paciente con ese CI');
    }

    // 2. Verificar email duplicado
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // 3. Verificar ciudad
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 4. Hashear CI como contraseña
    const hashedPassword = await this.hashService.hashear(ci);


    // 5. Crear usuario con ciudad
    const usuarioId = await this.usuarioRepository.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId: 3, // Paciente
      ciudadId,
    });

    // 6. Crear paciente
    const pacienteId = await this.pacienteRepository.create({
      ci,
      telefono,
      fechaNacimiento,
      genero: genero || null,
      usuarioId,
    });

    // 7. Crear historial
    await this.historialRepository.create(pacienteId);

    return {
      mensaje: 'Paciente registrado correctamente',
      pacienteId,
      credenciales: {
        email,
        password: ci,
      }
    };
  }
}

module.exports = RegistrarPaciente;
