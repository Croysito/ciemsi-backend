const ReservarCita        = require('../../application/use-cases/citas/ReservarCita');
const ModificarCita       = require('../../application/use-cases/citas/ModificarCita');
const CambiarEstadoCita   = require('../../application/use-cases/citas/CambiarEstadoCita');
const ObtenerCitas        = require('../../application/use-cases/citas/ObtenerCitas');
const CrearDeudaDesdeCita = require('../../application/use-cases/pagos/CrearDeudaDesdeCita');
const SubirComprobanteCita = require('../../application/use-cases/citas/SubirComprobanteCita');
const ConfirmarPagoCita    = require('../../application/use-cases/citas/ConfirmarPagoCita');

class CitaController {
  constructor({
    citaRepository,
    agendaRepository,
    pacienteRepository,
    deudaRepository,
    tratamientoRepository,
    notificacionService,
    ingresoRepository,
    configClinicaRepository,
  }) {
    this.citaRepository          = citaRepository;
    this.pacienteRepository      = pacienteRepository;
    this.notificacionService     = notificacionService;
    this.configClinicaRepository = configClinicaRepository;
    this.ingresoRepository       = ingresoRepository;
    this.obtenerCitas        = new ObtenerCitas(citaRepository);
    this.reservarCita        = new ReservarCita(citaRepository, agendaRepository, pacienteRepository);
    this.modificarCita       = new ModificarCita(citaRepository);
    this.cambiarEstadoCita   = new CambiarEstadoCita(citaRepository);
    this.crearDeudaDesdeCita = new CrearDeudaDesdeCita(deudaRepository, tratamientoRepository);
    this.subirComprobanteCita = new SubirComprobanteCita(citaRepository);
    this.confirmarPagoCita    = new ConfirmarPagoCita(citaRepository, ingresoRepository, configClinicaRepository);
  }

  async listar(req, res) {
    try {
      const { rol, ciudadId, id } = req.usuario;
      let pacienteId = null;
      if (rol === 'Paciente') {
        const paciente = await this.pacienteRepository.findByUsuarioId(id);
        if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        pacienteId = paciente.id;
      }

      const citas = await this.obtenerCitas.execute({ rol, ciudadId, pacienteId });
      return res.status(200).json(citas);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async reservar(req, res) {
    try {
      const { fecha, hora, pacienteId, servicioId, ciudadId, agendaId, notas } = req.body;
      const { id: usuarioId, rol } = req.usuario;

      if (!fecha || !hora || !servicioId) {
        return res.status(400).json({ mensaje: 'Fecha, hora y servicio son requeridos' });
      }

      let pacienteIdFinal = pacienteId;
      let ciudadIdFinal = ciudadId;

      if (rol === 'Paciente') {
        const paciente = await this.pacienteRepository.findByUsuarioId(usuarioId);
        if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        pacienteIdFinal = paciente.id;
        ciudadIdFinal = paciente.usuario.ciudad?.id;
      }

      if (!pacienteIdFinal || !ciudadIdFinal) {
        return res.status(400).json({ mensaje: 'Paciente y ciudad son requeridos' });
      }

      const { adelantoMonto, adelantoMetodo } = req.body;

      const resultado = await this.reservarCita.execute({
        fecha,
        hora,
        pacienteId: parseInt(pacienteIdFinal),
        servicioId: parseInt(servicioId),
        ciudadId: parseInt(ciudadIdFinal),
        agendaId: agendaId ? parseInt(agendaId) : null,
        notas,
        creadoPor: usuarioId,
        rolCreador: rol,
        adelantoMonto: adelantoMonto ?? null,
        adelantoMetodo: adelantoMetodo ?? null,
      });

      if (rol === 'Paciente') {
        const cita = await this.citaRepository.findById(resultado.citaId);
        await this.notificacionService.citaReservadaPorPaciente(cita);
      } else if (adelantoMonto && adelantoMetodo) {
        // Doctora/Asistente registra adelanto → crear ingreso inmediatamente
        await this.ingresoRepository.createAdelantoCita({
          pacienteId: parseInt(pacienteIdFinal),
          ciudadId:   parseInt(ciudadIdFinal),
          monto:      parseFloat(adelantoMonto),
          metodo:     adelantoMetodo,
          citaId:     resultado.citaId,
          createdBy:  usuarioId,
        });
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
        return res.status(400).json({ mensaje: 'Fecha, hora y servicio son requeridos' });
      }

      const resultado = await this.modificarCita.execute(parseInt(id), {
        fecha, hora, servicioId: parseInt(servicioId), notas,
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
      if (!estado) return res.status(400).json({ mensaje: 'El estado es requerido' });

      const resultado = await this.cambiarEstadoCita.execute(parseInt(id), estado, notas, rol);
      const cita = await this.citaRepository.findById(parseInt(id));

      switch (estado) {
        case 'CONFIRMADA':
          if (rol !== 'Paciente') await this.notificacionService.citaConfirmada(cita);
          else await this.notificacionService.pacienteAceptoModificacion(cita);
          break;
        case 'CANCELADA':
          if (rol === 'Paciente' && cita.estado === 'MODIFICADA') {
            await this.notificacionService.pacienteCanceloPorModificacion(cita);
          } else {
            await this.notificacionService.citaCancelada(cita);
          }
          break;
        case 'COMPLETADA':
          await this.notificacionService.citaCompletada(cita);
          await this.crearDeudaDesdeCita.execute(parseInt(id)).catch(() => {});
          break;
      }
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
  async obtenerQrPago(req, res) {
    try {
      const config = await this.configClinicaRepository.findConfig();
      return res.status(200).json({
        qrLink:        config.qr_drive_link ?? null,
        adelantoMonto: parseFloat(config.adelanto_monto) || 50,
      });
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async actualizarQrPago(req, res) {
    try {
      const { qrLink } = req.body;
      if (!qrLink) return res.status(400).json({ mensaje: 'qrLink requerido' });
      await this.configClinicaRepository.updateQrLink(qrLink);
      return res.status(200).json({ mensaje: 'QR actualizado correctamente' });
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async subirComprobante(req, res) {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ mensaje: 'Archivo requerido' });

      const resultado = await this.subirComprobanteCita.execute(parseInt(id), {
        buffer:       req.file.buffer,
        originalName: req.file.originalname,
        mimeType:     req.file.mimetype,
      });
      return res.status(200).json(resultado);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async confirmarPago(req, res) {
    try {
      const { id }  = req.params;
      const usuarioId = req.usuario.id;
      const resultado = await this.confirmarPagoCita.execute(parseInt(id), usuarioId);
      const cita = await this.citaRepository.findById(parseInt(id));
      await this.notificacionService.citaConfirmada(cita).catch(() => {});
      return res.status(200).json(resultado);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async obtenerComprobante(req, res) {
    try {
      const path = require('path');
      const fs   = require('fs');
      const { id } = req.params;
      const cita = await this.citaRepository.findById(parseInt(id));
      if (!cita || !cita.comprobantePath) {
        return res.status(404).json({ mensaje: 'Comprobante no encontrado' });
      }
      const filePath = path.join(process.cwd(), cita.comprobantePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ mensaje: 'Archivo no encontrado' });
      }
      res.sendFile(filePath);
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }
}

module.exports = CitaController;
