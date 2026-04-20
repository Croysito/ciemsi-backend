const bcrypt = require('bcryptjs');

class RegistrarPaciente {
  constructor(pacienteRepository, historialRepository, ciudadRepository, usuarioRepository) {
    this.pacienteRepository = pacienteRepository;
    this.historialRepository = historialRepository;
    this.ciudadRepository = ciudadRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId }) {
    // 1. Verificar que no exista un paciente con ese CI
    const pacienteExistente = await this.pacienteRepository.findByCi(ci);
    if (pacienteExistente) {
      throw new Error('Ya existe un paciente con ese CI');
    }

    // 2. Verificar que el email no esté en uso
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // 3. Verificar que la ciudad existe
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 4. Obtener el rol Paciente (id = 3)
    const rolPacienteId = 3;

    // 5. Hashear el CI como contraseña
    const hashedPassword = await bcrypt.hash(ci, 10);

    // 6. Crear el usuario
    const usuarioId = await this.usuarioRepository.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId: rolPacienteId,
    });

    // 7. Crear el paciente vinculado al usuario
    const pacienteId = await this.pacienteRepository.create({
      ci,
      edad,
      telefono,
      fechaNacimiento,
      ciudadId,
      usuarioId,
    });

    // 8. Crear automáticamente su historial clínico
    await this.historialRepository.create(pacienteId);

    return { 
      mensaje: 'Paciente registrado correctamente', 
      pacienteId,
      credenciales: {
        email,
        password: ci, // Solo se muestra una vez
      }
    };
  }
}

module.exports = RegistrarPaciente;