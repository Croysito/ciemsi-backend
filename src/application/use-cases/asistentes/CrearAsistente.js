class CrearAsistente {
  constructor(usuarioRepository, ciudadRepository, hashService) {
    this.usuarioRepository = usuarioRepository;
    this.ciudadRepository = ciudadRepository;
    this.hashService = hashService;
  }

  async execute({ nombre, apellido, email, ci, ciudadId }) {
    // 1. Verificar email duplicado
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // 2. Verificar ciudad
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 3. Hashear CI como password
    const hashedPassword = await this.hashService.hashear(ci);

    // 4. Crear usuario con rol Asistente (id = 2)
    const usuarioId = await this.usuarioRepository.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId: 2, // Asistente
      ciudadId,
    });

    return {
      mensaje: 'Asistente creado correctamente',
      usuarioId,
      credenciales: {
        email,
        password: ci,
      }
    };
  }
}

module.exports = CrearAsistente;
