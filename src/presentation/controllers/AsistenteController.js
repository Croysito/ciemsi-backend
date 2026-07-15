class AsistenteController {
  constructor({
    listarAsistentes,
    crearAsistente,
    modificarAsistente,
    cambiarEstadoAsistente,
    cambiarPassword,
    obtenerPermisosAsistente,
    actualizarPermisosAsistente,
  }) {
    this.listarAsistentes = listarAsistentes;
    this.crearAsistente = crearAsistente;
    this.modificarAsistente = modificarAsistente;
    this.cambiarEstadoAsistente = cambiarEstadoAsistente;
    this.cambiarPasswordUseCase = cambiarPassword;
    this.obtenerPermisosAsistente = obtenerPermisosAsistente;
    this.actualizarPermisosAsistente = actualizarPermisosAsistente;
  }

  async listar(req, res) {
    try {
      const asistentes = await this.listarAsistentes.execute();
      return res.status(200).json(asistentes);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const { nombre, apellido, email, ci, ciudadId } = req.body;
      if (!nombre || !apellido || !email || !ci || !ciudadId) {
        return res.status(400).json({
          mensaje: 'Nombre, apellido, email, CI y ciudad son requeridos',
        });
      }

      const resultado = await this.crearAsistente.execute({
        nombre, apellido, email, ci, ciudadId,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, ciudadId } = req.body;
      if (!nombre || !apellido || !email || !ciudadId) {
        return res.status(400).json({
          mensaje: 'Nombre, apellido, email y ciudad son requeridos',
        });
      }

      const resultado = await this.modificarAsistente.execute(parseInt(id), {
        nombre, apellido, email, ciudadId,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const resultado = await this.cambiarEstadoAsistente.execute(parseInt(id), estado);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async obtenerPermisos(req, res) {
    try {
      const { id } = req.params;
      const permisos = await this.obtenerPermisosAsistente.execute(parseInt(id));
      return res.status(200).json(permisos);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async actualizarPermisos(req, res) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;
      const resultado = await this.actualizarPermisosAsistente.execute(parseInt(id), permisos || {});
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async cambiarPassword(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { passwordActual, passwordNuevo } = req.body;
      if (!passwordActual || !passwordNuevo) {
        return res.status(400).json({
          mensaje: 'Password actual y nuevo son requeridos',
        });
      }

      const resultado = await this.cambiarPasswordUseCase.execute({
        usuarioId, passwordActual, passwordNuevo,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = AsistenteController;
