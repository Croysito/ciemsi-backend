class AuthController {
  constructor({ iniciarSesion, recuperarContrasena, cerrarSesion }) {
    this.iniciarSesionUseCase = iniciarSesion;
    this.recuperarContrasenaUseCase = recuperarContrasena;
    this.cerrarSesionUseCase = cerrarSesion;
  }

  async iniciarSesion(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
      }

      const resultado = await this.iniciarSesionUseCase.execute({ email, password });
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

      const resultado = await this.recuperarContrasenaUseCase.execute({ email });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  cerrarSesion(req, res) {
    try {
      const resultado = this.cerrarSesionUseCase.execute();
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = AuthController;
