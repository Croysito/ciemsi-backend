class RegistrarPacienteProvisional {
  constructor(pacienteRepository, ciudadRepository, hashService) {
    this.pacienteRepository = pacienteRepository;
    this.ciudadRepository = ciudadRepository;
    this.hashService = hashService;
  }

  async execute({ nombre, nombreCompleto, telefono, ciudadId, usuario }) {
    const nombrePaciente = (nombreCompleto || nombre || '').trim();
    const ciudadPacienteId = parseInt(ciudadId);

    if (!['Doctora', 'Asistente'].includes(usuario.rol)) {
      throw new Error('No tienes permisos para registrar pacientes provisionales');
    }

    if (!nombrePaciente || !telefono || !ciudadPacienteId) {
      throw new Error('Nombre, telefono y ciudad son requeridos');
    }

    if (
      usuario.rol === 'Asistente' &&
      parseInt(usuario.ciudadId) !== ciudadPacienteId
    ) {
      throw new Error('Solo puedes registrar pacientes de tu ciudad');
    }

    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === ciudadPacienteId);
    if (!ciudad) {
      throw new Error('Ciudad no valida');
    }

    const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const ci = `PROV-${uniqueSuffix}`;
    const email = `provisional.${uniqueSuffix}@ciemsi.local`;
    const password = await this.hashService.hashear(ci);

    const paciente = await this.pacienteRepository.createProvisional({
      nombreCompleto: nombrePaciente,
      telefono,
      ciudadId: ciudadPacienteId,
      ci,
      email,
      password,
    });

    return {
      mensaje: 'Paciente provisional registrado correctamente',
      paciente,
    };
  }
}

module.exports = RegistrarPacienteProvisional;
