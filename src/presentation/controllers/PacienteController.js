const RegistrarPaciente = require('../../application/use-cases/pacientes/RegistrarPaciente');
const ModificarPaciente = require('../../application/use-cases/pacientes/ModificarPaciente');
const ListarPacientes = require('../../application/use-cases/pacientes/ListarPacientes');
const ObtenerPaciente = require('../../application/use-cases/pacientes/ObtenerPaciente');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');
const HistorialRepository = require('../../infrastructure/repositories/HistorialRepository');
const CiudadRepository = require('../../infrastructure/repositories/CiudadRepository');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

const pacienteRepository = new PacienteRepository();
const historialRepository = new HistorialRepository();
const ciudadRepository = new CiudadRepository();
const usuarioRepository = new UsuarioRepository();

class PacienteController {
  async listar(req, res) {
    try {
      const { rol, ciudadId } = req.usuario;
      let pacientes;

      if (rol === 'Asistente' && ciudadId) {
        pacientes = await pacienteRepository.findByCiudad(parseInt(ciudadId));
      } else {
        pacientes = await new ListarPacientes(pacienteRepository).execute();
      }

      return res.status(200).json(pacientes);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtener(req, res) {
    try {
      const { id } = req.params;
      const useCase = new ObtenerPaciente(pacienteRepository);
      const paciente = await useCase.execute(parseInt(id));
      return res.status(200).json(paciente);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }

  async registrar(req, res) {
    try {
      const { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId } = req.body;

      if (!ci || !nombre || !apellido || !email || !ciudadId) {
        return res.status(400).json({
          mensaje: 'CI, nombre, apellido, email y ciudad son requeridos'
        });
      }

      const useCase = new RegistrarPaciente(
        pacienteRepository,
        historialRepository,
        ciudadRepository,
        usuarioRepository
      );
      const resultado = await useCase.execute({
        ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { ci, edad, telefono, fechaNacimiento, ciudadId } = req.body;

      if (!ci || !ciudadId) {
        return res.status(400).json({ mensaje: 'CI y ciudad son requeridos' });
      }

      const useCase = new ModificarPaciente(pacienteRepository, ciudadRepository);
      const resultado = await useCase.execute(parseInt(id), {
        ci, edad, telefono, fechaNacimiento, ciudadId,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new PacienteController();