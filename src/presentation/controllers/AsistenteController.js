const CrearAsistente = require('../../application/use-cases/asistentes/CrearAsistente');
const ListarAsistentes = require('../../application/use-cases/asistentes/ListarAsistentes');
const ModificarAsistente = require('../../application/use-cases/asistentes/ModificarAsistente');
const CambiarEstadoAsistente = require('../../application/use-cases/asistentes/CambiarEstadoAsistente');
const CambiarPassword = require('../../application/use-cases/auth/CambiarPassword');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const CiudadRepository = require('../../infrastructure/repositories/CiudadRepository');

const usuarioRepository = new UsuarioRepository();
const ciudadRepository = new CiudadRepository();

class AsistenteController {
  async listar(req, res) {
    try {
      const useCase = new ListarAsistentes(usuarioRepository);
      const asistentes = await useCase.execute();
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
          mensaje: 'Nombre, apellido, email, CI y ciudad son requeridos'
        });
      }
      const useCase = new CrearAsistente(usuarioRepository, ciudadRepository);
      const resultado = await useCase.execute({
        nombre, apellido, email, ci, ciudadId
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
          mensaje: 'Nombre, apellido, email y ciudad son requeridos'
        });
      }
      const useCase = new ModificarAsistente(usuarioRepository, ciudadRepository);
      const resultado = await useCase.execute(parseInt(id), {
        nombre, apellido, email, ciudadId
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
      const useCase = new CambiarEstadoAsistente(usuarioRepository);
      const resultado = await useCase.execute(parseInt(id), estado);
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
          mensaje: 'Password actual y nuevo son requeridos'
        });
      }
      const useCase = new CambiarPassword(usuarioRepository);
      const resultado = await useCase.execute({
        usuarioId, passwordActual, passwordNuevo
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new AsistenteController();