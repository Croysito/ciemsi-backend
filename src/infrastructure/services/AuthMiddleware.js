const JwtService = require('./JwtService');

const jwtService = new JwtService();

const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtener el token del header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // 2. El header viene como "Bearer eltoken123..."
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ mensaje: 'Formato de token inválido' });
    }

    // 3. Verificar el token
    const payload = jwtService.verificarToken(token);

    // 4. Adjuntar el usuario al request
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: error.message });
  }
};

module.exports = authMiddleware;