const RegistrarPaciente = require('../../application/use-cases/pacientes/RegistrarPaciente');
const ModificarPaciente = require('../../application/use-cases/pacientes/ModificarPaciente');
const CompletarPaciente = require('../../application/use-cases/pacientes/CompletarPaciente');
const ListarPacientes = require('../../application/use-cases/pacientes/ListarPacientes');
const ObtenerPaciente = require('../../application/use-cases/pacientes/ObtenerPaciente');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');
const HistorialRepository = require('../../infrastructure/repositories/HistorialRepository');
const CiudadRepository = require('../../infrastructure/repositories/CiudadRepository');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const HashService = require('../../infrastructure/services/HashService');

const pacienteRepository = new PacienteRepository();
const historialRepository = new HistorialRepository();
const ciudadRepository = new CiudadRepository();
const usuarioRepository = new UsuarioRepository();
const hashService = new HashService();

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
        usuarioRepository,
        hashService
      );
      const resultado = await useCase.execute({
        ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async registrarProvisional(req, res) {
    try {
      const { nombre, nombreCompleto, telefono, ciudadId } = req.body;
      const nombrePaciente = (nombreCompleto || nombre || '').trim();
      const ciudadPacienteId = parseInt(ciudadId);

      if (!['Doctora', 'Asistente'].includes(req.usuario.rol)) {
        return res.status(403).json({
          mensaje: 'No tienes permisos para registrar pacientes provisionales'
        });
      }

      if (!nombrePaciente || !telefono || !ciudadPacienteId) {
        return res.status(400).json({
          mensaje: 'Nombre, telefono y ciudad son requeridos'
        });
      }

      if (
        req.usuario.rol === 'Asistente' &&
        parseInt(req.usuario.ciudadId) !== ciudadPacienteId
      ) {
        return res.status(403).json({
          mensaje: 'Solo puedes registrar pacientes de tu ciudad'
        });
      }

      const ciudades = await ciudadRepository.findAll();
      const ciudad = ciudades.find(c => c.id === ciudadPacienteId);
      if (!ciudad) {
        return res.status(400).json({ mensaje: 'Ciudad no valida' });
      }

      const paciente = await pacienteRepository.createProvisional({
        nombreCompleto: nombrePaciente,
        telefono,
        ciudadId: ciudadPacienteId,
      });

      return res.status(201).json({
        mensaje: 'Paciente provisional registrado correctamente',
        paciente,
      });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
async completar(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId } = req.body;

    const useCase = new CompletarPaciente(
      pacienteRepository,
      ciudadRepository,
      usuarioRepository
    );

    const resultado = await useCase.execute(id, {
      ci,
      nombre,
      apellido,
      email,
      edad: edad ? parseInt(edad) : null,
      telefono,
      fechaNacimiento: fechaNacimiento || null,
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
      const {
        ci,
        nombre,
        apellido,
        email,
        edad,
        telefono,
        fechaNacimiento,
        ciudadId
      } = req.body;

      if (!ci || !ciudadId) {
        return res.status(400).json({ mensaje: 'CI y ciudad son requeridos' });
      }

      const useCase = new ModificarPaciente(
        pacienteRepository,
        ciudadRepository,
        usuarioRepository
      );
      const resultado = await useCase.execute(parseInt(id), {
        ci, nombre, apellido, email, edad, telefono, fechaNacimiento, ciudadId,
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new PacienteController();
