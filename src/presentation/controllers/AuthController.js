const IniciarSesion = require('../../application/use-cases/auth/IniciarSesion');
const RecuperarContrasena = require('../../application/use-cases/auth/RecuperarContrasena');
const CerrarSesion = require('../../application/use-cases/auth/CerrarSesion');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

const usuarioRepository = new UsuarioRepository();

class AuthController {
  async iniciarSesion(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
      }

      const useCase = new IniciarSesion(usuarioRepository);
      const resultado = await useCase.execute({ email, password });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({ mensaje: error.message });
    }
  }

  async recuperarContrasena(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ mensaje: 'El email es requerido' });
      }

      const useCase = new RecuperarContrasena(usuarioRepository);
      const resultado = await useCase.execute({ email });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  cerrarSesion(req, res) {
    try {
      const useCase = new CerrarSesion();
      const resultado = useCase.execute();
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = new AuthController();