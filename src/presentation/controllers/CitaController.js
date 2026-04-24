const ReservarCita = require('../../application/use-cases/citas/ReservarCita');
const ModificarCita = require('../../application/use-cases/citas/ModificarCita');
const CambiarEstadoCita = require('../../application/use-cases/citas/CambiarEstadoCita');
const ObtenerCitas = require('../../application/use-cases/citas/ObtenerCitas');
const CitaRepository = require('../../infrastructure/repositories/CitaRepository');
const AgendaRepository = require('../../infrastructure/repositories/AgendaRepository');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');
const NotificacionService = require('../../infrastructure/services/NotificacionService');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');


const citaRepository = new CitaRepository();
const agendaRepository = new AgendaRepository();
const pacienteRepository = new PacienteRepository();
const usuarioRepository = new UsuarioRepository();
const notificacionService = new NotificacionService(usuarioRepository);

class CitaController {
  async listar(req, res) {
    try {
      const { rol, ciudadId, id } = req.usuario;

      let pacienteId = null;
      if (rol === 'Paciente') {
        const paciente = await pacienteRepository.findByUsuarioId(id);
        if (!paciente) {
          return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }
        pacienteId = paciente.id;
      }

      const useCase = new ObtenerCitas(citaRepository);
      const citas = await useCase.execute({ rol, ciudadId, pacienteId });
      return res.status(200).json(citas);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async reservar(req, res) {
    try {
      const { fecha, hora, pacienteId, servicioId, ciudadId, notas } = req.body;
      const { id: usuarioId, rol } = req.usuario;

      if (!fecha || !hora || !servicioId) {
        return res.status(400).json({
          mensaje: 'Fecha, hora y servicio son requeridos'
        });
      }

      // Si es paciente obtener su pacienteId automáticamente
      let pacienteIdFinal = pacienteId;
      let ciudadIdFinal = ciudadId;

      if (rol === 'Paciente') {
        const paciente = await pacienteRepository.findByUsuarioId(usuarioId);
        if (!paciente) {
          return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }
        pacienteIdFinal = paciente.id;
        ciudadIdFinal = paciente.usuario.ciudad?.id;
      }

      if (!pacienteIdFinal || !ciudadIdFinal) {
        return res.status(400).json({
          mensaje: 'Paciente y ciudad son requeridos'
        });
      }

      const useCase = new ReservarCita(
        citaRepository, agendaRepository, pacienteRepository
      );
      const resultado = await useCase.execute({
        fecha,
        hora,
        pacienteId: parseInt(pacienteIdFinal),
        servicioId: parseInt(servicioId),
        ciudadId: parseInt(ciudadIdFinal),
        notas,
        creadoPor: usuarioId,
        rolCreador: rol,
      });
       // Enviar notificación si la creó el paciente
      if (rol === 'Paciente') {
    const cita = await citaRepository.findById(resultado.citaId);
    await notificacionService.citaReservadaPorPaciente(cita);
  }


      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      const { id } = req.params;
      const { fecha, hora, servicioId, notas } = req.body;

      if (!fecha || !hora || !servicioId) {
        return res.status(400).json({
          mensaje: 'Fecha, hora y servicio son requeridos'
        });
      }

      const useCase = new ModificarCita(citaRepository);
      const resultado = await useCase.execute(parseInt(id), {
        fecha, hora, servicioId: parseInt(servicioId), notas
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, notas } = req.body;
      const { rol } = req.usuario;

      if (!estado) {
        return res.status(400).json({ mensaje: 'El estado es requerido' });
      }

      const useCase = new CambiarEstadoCita(citaRepository);
      const resultado = await useCase.execute(
        parseInt(id), estado, notas, rol
      );
      const cita = await citaRepository.findById(parseInt(id));
  switch (estado) {
    case 'CONFIRMADA':
      if (rol !== 'Paciente') {
        await notificacionService.citaConfirmada(cita);
      } else {
        await notificacionService.pacienteAceptoModificacion(cita);
      }
      break;
    case 'CANCELADA':
      if (rol === 'Paciente' && cita.estado === 'MODIFICADA') {
        await notificacionService.pacienteCanceloPorModificacion(cita);
      } else {
        await notificacionService.citaCancelada(cita);
      }
      break;
    case 'COMPLETADA':
      await notificacionService.citaCompletada(cita);
      break;
  }
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new CitaController();