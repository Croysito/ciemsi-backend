class CompletarPaciente {
  constructor(pacienteRepository, ciudadRepository, usuarioRepository) {
    this.pacienteRepository = pacienteRepository;
    this.ciudadRepository = ciudadRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id, { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId }) {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Verificar que es provisional
    if (!paciente.ci.startsWith('PROV-')) {
      throw new Error('Este paciente ya tiene datos completos');
    }

    // Validar campos requeridos
    if (!ci || !nombre || !apellido || !email || !ciudadId) {
      throw new Error('CI, nombre, apellido, email y ciudad son requeridos');
    }

    // Verificar CI duplicado
    const pacienteConCi = await this.pacienteRepository.findByCi(ci);
    if (pacienteConCi) throw new Error('Ya existe un paciente con ese CI');

    // Verificar email duplicado
    const usuarioConEmail = await this.usuarioRepository.findByEmail(email);
    if (usuarioConEmail) throw new Error('Ya existe un usuario con ese email');

    // Verificar ciudad válida
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) throw new Error('Ciudad no válida');

    await this.pacienteRepository.completar(id, {
      ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId,
    });

    return { mensaje: 'Datos del paciente completados correctamente' };
  }
}

module.exports = CompletarPaciente;