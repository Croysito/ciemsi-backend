class ModificarAsistente {
  constructor(usuarioRepository, ciudadRepository) {
    this.usuarioRepository = usuarioRepository;
    this.ciudadRepository = ciudadRepository;
  }

  async execute(id, { nombre, apellido, email, ciudadId }) {
    // 1. Verificar que existe
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Asistente no encontrado');
    }

    // 2. Verificar email duplicado si cambió
    if (email !== usuario.email) {
      const usuarioConEmail = await this.usuarioRepository.findByEmail(email);
      if (usuarioConEmail) {
        throw new Error('Ya existe un usuario con ese email');
      }
    }

    // 3. Verificar ciudad
    const ciudades = await this.ciudadRepository.findAll();
    const ciudad = ciudades.find(c => c.id === parseInt(ciudadId));
    if (!ciudad) {
      throw new Error('Ciudad no válida');
    }

    // 4. Actualizar
    await this.usuarioRepository.update(id, {
      nombre, apellido, email, ciudadId
    });

    return { mensaje: 'Asistente actualizado correctamente' };
  }
}

module.exports = ModificarAsistente;