const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

class RecuperarContrasena {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ email }) {
    // 1. Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('No existe una cuenta con ese email');
    }

    // 2. Generar contraseña temporal
    const contrasenaTemporal = Math.random().toString(36).slice(-8);

    // 3. Hashear y guardar la nueva contraseña
    const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);
    await this.usuarioRepository.updatePassword(usuario.id, hashedPassword);

    // 4. Enviar email con la contraseña temporal
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña - CIEMSI',
      html: `
        <h3>Recuperación de contraseña</h3>
        <p>Hola <b>${usuario.nombre}</b>,</p>
        <p>Tu contraseña temporal es: <b>${contrasenaTemporal}</b></p>
        <p>Por seguridad, cámbiala después de iniciar sesión.</p>
      `,
    });

    return { mensaje: 'Se envió una contraseña temporal a tu correo' };
  }
}

module.exports = RecuperarContrasena;