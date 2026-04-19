const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class IniciarSesion {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ email, password }) {
    // 1. Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }

    // 2. Verificar que el usuario está activo
    if (!usuario.estado) {
      throw new Error('Usuario inactivo, contacte al administrador');
    }

    // 3. Verificar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new Error('Credenciales incorrectas');
    }

    // 4. Generar el token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol.nombreRol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombreRol,
      },
    };
  }
}

module.exports = IniciarSesion;