const jwt = require('jsonwebtoken');

class JwtService {
  verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = JwtService;