const { enviarMensaje, generarNotaFinal, generarAudio } = require('../../infrastructure/services/OpenAIService');

class ChatbotController {
  constructor({ historialRepository, pacienteRepository, sesionAsistenteRepository }) {
    this.historialRepo = historialRepository;
    this.pacienteRepo  = pacienteRepository;
    this.sesionRepo    = sesionAsistenteRepository;
  }

  async tts(req, res) {
    try {
      const { texto } = req.body;
      if (!texto) return res.status(400).json({ mensaje: 'texto requerido' });

      const audioBuffer = await generarAudio(texto.slice(0, 4096)); // límite de seguridad
      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } catch (e) {
      console.error('[ChatbotController.tts]', e);
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async estado(req, res) {
    try {
      const { id: usuarioId } = req.usuario;
      const paciente = await this.pacienteRepo.findByUsuarioId(usuarioId);
      if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });

      const historial = await this.historialRepo.findByPacienteId(paciente.id);

      const ci = paciente.ci && !paciente.ci.startsWith('PROV-') ? paciente.ci : null;

      return res.status(200).json({
        esNuevo: historial === null,
        perfil: {
          nombreCompleto: paciente.nombreCompleto || null,
          ci,
          telefono:        paciente.telefono        || null,
          fechaNacimiento: paciente.fechaNacimiento  || null,
          edad:            paciente.edad             ?? null,
        },
      });
    } catch (e) {
      console.error('[ChatbotController.estado]', e);
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async chat(req, res) {
    try {
      const { nuevoMensaje } = req.body;
      if (!nuevoMensaje) return res.status(400).json({ mensaje: 'nuevoMensaje requerido' });

      const { id: usuarioId, nombre, ciudadNombre } = req.usuario;

      const paciente = await this.pacienteRepo.findByUsuarioId(usuarioId);
      if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });

      // Obtener o crear sesión activa
      let sesion = await this.sesionRepo.findActiva(paciente.id);
      if (!sesion) sesion = await this.sesionRepo.crear(paciente.id);

      // Cargar notas recientes del historial (contexto de la doctora)
      let historialContexto = null;
      const historial = await this.historialRepo.findByPacienteId(paciente.id);
      if (historial) {
        const notas = await this.historialRepo.getNotasRecientes(historial.id, 5);
        if (notas.length > 0) {
          historialContexto = notas
            .map(n => `[${new Date(n.fecha).toLocaleDateString('es-BO')}] ${n.detalle}`)
            .join('\n\n---\n\n');
        }
      }

      const resultado = await enviarMensaje({
        nombre,
        ciudad: ciudadNombre,
        nuevoMensaje,
        resumenPrevio: sesion.resumen || null,
        historialContexto,
      });

      await this.sesionRepo.actualizarResumen(sesion.id, resultado.resumen || sesion.resumen);

      return res.status(200).json({
        respuesta: resultado.respuesta,
        listo:     resultado.listo ?? false,
      });
    } catch (e) {
      console.error('[ChatbotController.chat]', e);
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async finalizar(req, res) {
    try {
      const { id: usuarioId, nombre } = req.usuario;

      const paciente = await this.pacienteRepo.findByUsuarioId(usuarioId);
      if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });

      const sesion = await this.sesionRepo.findActiva(paciente.id);
      if (!sesion || !sesion.resumen) {
        return res.status(400).json({ mensaje: 'No hay conversación activa para guardar' });
      }

      let historial = await this.historialRepo.findByPacienteId(paciente.id);
      if (!historial) historial = await this.historialRepo.create(paciente.id);

      const notaFormateada = await generarNotaFinal(sesion.resumen, nombre);

      const nota = await this.historialRepo.addNota({
        fecha:       new Date(),
        detalle:     notaFormateada,
        historialId: historial.id,
      });

      await this.sesionRepo.cerrar(sesion.id);

      return res.status(201).json({ nota, mensaje: 'Historia clínica guardada correctamente' });
    } catch (e) {
      console.error('[ChatbotController.finalizar]', e);
      return res.status(500).json({ mensaje: e.message });
    }
  }
}

module.exports = ChatbotController;
