const firebaseService = require('./FirebaseService');

class NotificacionService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  // Notificar cuando paciente reserva cita
  async citaReservadaPorPaciente(cita) {
    // Notificar a Doctora (rol 1)
    const tokensDoctora = await this.usuarioRepository.getFcmTokensByRol(1);
    // Notificar a Asistentes de esa ciudad (rol 2)
    const tokensAsistentes = await this.usuarioRepository
      .getFcmTokensByCiudadYRol(cita.ciudad.id, 2);

    const tokens = [...tokensDoctora, ...tokensAsistentes];
    if (tokens.length > 0) {
      await firebaseService.enviarNotificacionMultiple({
        tokens,
        titulo: '📅 Nueva cita pendiente',
        cuerpo: `${cita.paciente.nombreCompleto} reservó una cita para el ${cita.fecha} a las ${cita.hora}`,
        datos: { citaId: String(cita.id), tipo: 'NUEVA_CITA' },
      });
    }
  }

  // Notificar al paciente cuando confirman su cita
  async citaConfirmada(cita) {
    const token = await this.usuarioRepository
      .getFcmTokenById(cita.paciente.usuario.id);
    if (token) {
      await firebaseService.enviarNotificacion({
        token,
        titulo: '✅ Cita confirmada',
        cuerpo: `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido confirmada`,
        datos: { citaId: String(cita.id), tipo: 'CITA_CONFIRMADA' },
      });
    }
  }

  // Notificar al paciente cuando modifican su cita
  async citaModificada(cita) {
    const token = await this.usuarioRepository
      .getFcmTokenById(cita.paciente.usuario.id);
    if (token) {
      await firebaseService.enviarNotificacion({
        token,
        titulo: '📝 Cita modificada',
        cuerpo: `Tu cita ha sido modificada al ${cita.fecha} a las ${cita.hora}. Por favor confirma o cancela.`,
        datos: { citaId: String(cita.id), tipo: 'CITA_MODIFICADA' },
      });
    }
  }

  // Notificar al paciente cuando cancelan su cita
  async citaCancelada(cita) {
    const token = await this.usuarioRepository
      .getFcmTokenById(cita.paciente.usuario.id);
    if (token) {
      await firebaseService.enviarNotificacion({
        token,
        titulo: '❌ Cita cancelada',
        cuerpo: `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido cancelada`,
        datos: { citaId: String(cita.id), tipo: 'CITA_CANCELADA' },
      });
    }
  }

  // Notificar a Dra y Asistente cuando paciente acepta modificación
  async pacienteAceptoModificacion(cita) {
    const tokensDoctora = await this.usuarioRepository.getFcmTokensByRol(1);
    const tokensAsistentes = await this.usuarioRepository
      .getFcmTokensByCiudadYRol(cita.ciudad.id, 2);

    const tokens = [...tokensDoctora, ...tokensAsistentes];
    if (tokens.length > 0) {
      await firebaseService.enviarNotificacionMultiple({
        tokens,
        titulo: '✅ Modificación aceptada',
        cuerpo: `${cita.paciente.nombreCompleto} aceptó la modificación de su cita`,
        datos: { citaId: String(cita.id), tipo: 'MODIFICACION_ACEPTADA' },
      });
    }
  }

  // Notificar cuando paciente cancela por modificación
  async pacienteCanceloPorModificacion(cita) {
    const tokensDoctora = await this.usuarioRepository.getFcmTokensByRol(1);
    const tokensAsistentes = await this.usuarioRepository
      .getFcmTokensByCiudadYRol(cita.ciudad.id, 2);

    const tokens = [...tokensDoctora, ...tokensAsistentes];
    if (tokens.length > 0) {
      await firebaseService.enviarNotificacionMultiple({
        tokens,
        titulo: '❌ Cita cancelada por paciente',
        cuerpo: `${cita.paciente.nombreCompleto} canceló su cita por la modificación`,
        datos: { citaId: String(cita.id), tipo: 'CANCELADA_POR_PACIENTE' },
      });
    }
  }

  // Notificar cuando cita se completa
  async citaCompletada(cita) {
    const token = await this.usuarioRepository
      .getFcmTokenById(cita.paciente.usuario.id);
    if (token) {
      await firebaseService.enviarNotificacion({
        token,
        titulo: '🏥 Consulta completada',
        cuerpo: 'Tu consulta ha sido registrada como completada',
        datos: { citaId: String(cita.id), tipo: 'CITA_COMPLETADA' },
      });
    }
  }
  async tratamientoAsignado(tratamientoAsignado) {
  const tokensAsistentes = await this.usuarioRepository
    .getFcmTokensByCiudadYRol(tratamientoAsignado.ciudad.id, 2);
  if (tokensAsistentes.length > 0) {
    await firebaseService.enviarNotificacionMultiple({
      tokens: tokensAsistentes,
      titulo: '💊 Nuevo tratamiento asignado',
      cuerpo: `Tratamiento: ${tratamientoAsignado.tratamiento.nombreTratamiento}`,
      datos: { tratamientoId: String(tratamientoAsignado.id), tipo: 'TRATAMIENTO_ASIGNADO' },
    });
  }
}

async tratamientoCompletado(tratamientoAsignado) {
  const tokensDoctora = await this.usuarioRepository.getFcmTokensByRol(1);
  if (tokensDoctora.length > 0) {
    await firebaseService.enviarNotificacionMultiple({
      tokens: tokensDoctora,
      titulo: '✅ Tratamiento completado',
      cuerpo: `El tratamiento ${tratamientoAsignado.tratamiento.nombreTratamiento} fue completado`,
      datos: { tratamientoId: String(tratamientoAsignado.id), tipo: 'TRATAMIENTO_COMPLETADO' },
    });
  }
}
}

module.exports = NotificacionService;