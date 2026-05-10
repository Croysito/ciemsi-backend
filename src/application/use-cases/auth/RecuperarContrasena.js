class RecuperarContrasena {
  constructor(usuarioRepository, hashService, emailService) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.emailService = emailService;
  }

  async execute({ email }) {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('No existe una cuenta con ese email');
    }

    const contrasenaTemporal = Math.random().toString(36).slice(-8);
    const hashedPassword = await this.hashService.hashear(contrasenaTemporal);
    await this.usuarioRepository.updatePassword(usuario.id, hashedPassword);

    await this.emailService.enviar({
      to: email,
      subject: 'Recuperacion de contrasena - CIEMSI',
      html: `
        <h3>Recuperacion de contrasena</h3>
        <p>Hola <b>${usuario.nombre}</b>,</p>
        <p>Tu contrasena temporal es: <b>${contrasenaTemporal}</b></p>
        <p>Por seguridad, cambiala despues de iniciar sesion.</p>
      `,
    });

    return { mensaje: 'Se envio una contrasena temporal a tu correo' };
  }
}

module.exports = RecuperarContrasena;
