const CrearAgenda = require('../../application/use-cases/agenda/CrearAgenda');
const ObtenerDisponibilidad = require('../../application/use-cases/agenda/ObtenerDisponibilidad');

class AgendaController {
  constructor({ agendaRepository, citaRepository, ciudadRepository }) {
    this.agendaRepository = agendaRepository;
    this.crearAgenda = new CrearAgenda(agendaRepository, ciudadRepository);
    this.obtenerDisponibilidad = new ObtenerDisponibilidad(agendaRepository, citaRepository);
  }

  async listar(req, res) {
    try {
      const { ciudadId } = req.query;
      const agendas = await this.agendaRepository.findByCiudad(
        ciudadId ? parseInt(ciudadId) : null
      );
      return res.status(200).json(agendas);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      const { fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId } = req.body;
      if (!horaInicio || !horaFin || !ciudadId) {
        return res.status(400).json({
          mensaje: 'Hora inicio, hora fin y ciudad son requeridos',
        });
      }
      const resultado = await this.crearAgenda.execute({
        fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId,
        usuarioId: req.usuario.id,
        rolUsuario: req.usuario.rol,
        ciudadIdUsuario: req.usuario.ciudadId,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async disponibilidad(req, res) {
    try {
      const { ciudadId, fecha } = req.query;
      if (!ciudadId || !fecha) {
        return res.status(400).json({
          mensaje: 'ciudadId y fecha son requeridos',
        });
      }
      const resultado = await this.obtenerDisponibilidad.execute(parseInt(ciudadId), fecha);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      if (typeof estado !== 'boolean') {
        return res.status(400).json({ mensaje: 'El campo estado debe ser booleano' });
      }
      await this.agendaRepository.updateEstado(parseInt(id), estado);
      return res.status(200).json({ mensaje: 'Estado de agenda actualizado correctamente' });
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      await this.agendaRepository.delete(parseInt(req.params.id));
      return res.status(200).json({ mensaje: 'Agenda eliminada correctamente' });
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = AgendaController;
