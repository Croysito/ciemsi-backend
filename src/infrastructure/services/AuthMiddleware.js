const JwtService = require('./JwtService');

const jwtService = new JwtService();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ mensaje: 'Formato de token inválido' });
    }

    const payload = jwtService.verificarToken(token);

    // Asegurar que el id sea un número entero
    req.usuario = {
      ...payload,
      id: parseInt(payload.id),
    };
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: error.message });
  }
};

module.exports = authMiddleware;