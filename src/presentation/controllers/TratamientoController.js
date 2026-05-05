const ListarTratamientos = require('../../application/use-cases/tratamientos/ListarTratamientos');
const CrearTratamiento = require('../../application/use-cases/tratamientos/CrearTratamiento');
const AsignarTratamiento = require('../../application/use-cases/tratamientos/AsignarTratamiento');
const AgregarSupministroAsistente = require('../../application/use-cases/tratamientos/AgregarSupministroAsistente');
const CompletarTratamiento = require('../../application/use-cases/tratamientos/CompletarTratamiento');
const CambiarEstadoTratamientoAsignado = require('../../application/use-cases/tratamientos/CambiarEstadoTratamientoAsignado');
const TratamientoRepository = require('../../infrastructure/repositories/TratamientoRepository');
const CitaRepository = require('../../infrastructure/repositories/CitaRepository');
const SuministroRepository = require('../../infrastructure/repositories/SuministroRepository');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');
const NotificacionService = require('../../infrastructure/services/NotificacionService');

const tratamientoRepository = new TratamientoRepository();
const citaRepository = new CitaRepository();
const suministroRepository = new SuministroRepository();
const usuarioRepository = new UsuarioRepository();
const pacienteRepository = new PacienteRepository();
const notificacionService = new NotificacionService(usuarioRepository);

class TratamientoController {
  async listar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const useCase = new ListarTratamientos(tratamientoRepository);
      const tratamientos = await useCase.execute();
      return res.status(200).json(tratamientos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { nombreTratamiento, detalle, precioBase, medicamentosBase } = req.body;
      const useCase = new CrearTratamiento(tratamientoRepository, suministroRepository);
      const resultado = await useCase.execute({
        nombreTratamiento, detalle, precioBase, medicamentosBase,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { id } = req.params;
      await tratamientoRepository.update(parseInt(id), req.body);
      return res.status(200).json({ mensaje: 'Tratamiento actualizado correctamente' });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async asignar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { tratamientoId, citaId, precio, medicamentos } = req.body;
      if (!tratamientoId || !citaId) {
        return res.status(400).json({
          mensaje: 'Tratamiento y cita son requeridos'
        });
      }
      const useCase = new AsignarTratamiento(
        tratamientoRepository, citaRepository,
        suministroRepository, notificacionService
      );
      const resultado = await useCase.execute({
        tratamientoId, citaId, precio, medicamentos,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async listarAsignados(req, res) {
    try {
      const { rol, ciudadId, id } = req.usuario;
      let tratamientos;

      if (rol === 'Paciente') {
        const paciente = await pacienteRepository.findByUsuarioId(id);
        if (!paciente) {
          return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }
        tratamientos = await tratamientoRepository.findAsignadosByPaciente(
          paciente.id
        );
        tratamientos = tratamientos.map(({ suministros, ...tratamiento }) => ({
          ...tratamiento,
          suministros: [],
        }));
      } else if (rol === 'Asistente' && ciudadId) {
        tratamientos = await tratamientoRepository.findAsignadosByCiudad(
          parseInt(ciudadId)
        );
      } else {
        tratamientos = await tratamientoRepository.findAsignados();
      }
      return res.status(200).json(tratamientos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtenerAsignadosByCita(req, res) {
    try {
      const { citaId } = req.params;
      if (req.usuario?.rol === 'Paciente') {
        const cita = await citaRepository.findById(parseInt(citaId));
        if (!cita || cita.paciente.usuario.id !== req.usuario.id) {
          return res.status(403).json({ mensaje: 'No autorizado' });
        }
      }
      const tratamientos = await tratamientoRepository.findAsignadosByCita(
        parseInt(citaId)
      );
      return res.status(200).json(tratamientos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async agregarSupministro(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { id } = req.params;
      const { suministroId, cantidad } = req.body;
      if (!suministroId || !cantidad) {
        return res.status(400).json({
          mensaje: 'Suministro y cantidad son requeridos'
        });
      }
      const useCase = new AgregarSupministroAsistente(
        tratamientoRepository, suministroRepository
      );
      const resultado = await useCase.execute({
        tratamientoAsignadoId: parseInt(id),
        suministroId: parseInt(suministroId),
        cantidad: parseInt(cantidad),
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async completar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { id } = req.params;
      const useCase = new CompletarTratamiento(
        tratamientoRepository, notificacionService
      );
      const resultado = await useCase.execute(parseInt(id));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async cambiarEstadoAsignado(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      const { id } = req.params;
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ mensaje: 'El estado es requerido' });
      }

      const useCase = new CambiarEstadoTratamientoAsignado(tratamientoRepository);
      const resultado = await useCase.execute(parseInt(id), estado);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new TratamientoController();
