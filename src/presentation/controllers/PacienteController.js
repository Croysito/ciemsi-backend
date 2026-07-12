class PacienteController {
  constructor({
    listarPacientesPorUsuario,
    obtenerPaciente,
    registrarPaciente,
    registrarPacienteProvisional,
    completarPaciente,
    modificarPaciente,
    obtenerMiPerfilPaciente,
  }) {
    this.listarPacientesPorUsuario = listarPacientesPorUsuario;
    this.obtenerPaciente = obtenerPaciente;
    this.registrarPaciente = registrarPaciente;
    this.registrarPacienteProvisional = registrarPacienteProvisional;
    this.completarPaciente = completarPaciente;
    this.modificarPaciente = modificarPaciente;
    this.obtenerMiPerfilPaciente = obtenerMiPerfilPaciente;
  }

  async listar(req, res) {
    try {
      const pacientes = await this.listarPacientesPorUsuario.execute(req.usuario);
      return res.status(200).json(pacientes);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtener(req, res) {
    try {
      const paciente = await this.obtenerPaciente.execute(parseInt(req.params.id));
      return res.status(200).json(paciente);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }

  async miPerfil(req, res) {
    try {
      const paciente = await this.obtenerMiPerfilPaciente.execute(parseInt(req.usuario.id));
      return res.status(200).json(paciente);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }

  async registrar(req, res) {
    try {
      const { ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId } = req.body;

      if (!ci || !nombre || !apellido || !email || !ciudadId) {
        return res.status(400).json({
          mensaje: 'CI, nombre, apellido, email y ciudad son requeridos',
        });
      }

      const resultado = await this.registrarPaciente.execute({
        ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async registrarProvisional(req, res) {
    try {
      const resultado = await this.registrarPacienteProvisional.execute({
        ...req.body,
        usuario: req.usuario,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      const status = error.message.includes('permisos') || error.message.includes('Solo puedes')
        ? 403
        : 400;
      return res.status(status).json({ mensaje: error.message });
    }
  }

  async completar(req, res) {
    try {
      const { ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId } = req.body;
      const resultado = await this.completarPaciente.execute(parseInt(req.params.id), {
        ci,
        nombre,
        apellido,
        email,
        telefono,
        fechaNacimiento: fechaNacimiento || null,
        genero: genero || null,
        ciudadId,
      });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId } = req.body;

      if (!ci || !ciudadId) {
        return res.status(400).json({ mensaje: 'CI y ciudad son requeridos' });
      }

      const resultado = await this.modificarPaciente.execute(parseInt(id), {
        ci, nombre, apellido, email, telefono, fechaNacimiento, genero, ciudadId,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = PacienteController;
