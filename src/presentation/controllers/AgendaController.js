const CrearAgenda = require('../../application/use-cases/agenda/CrearAgenda');
const ObtenerDisponibilidad = require('../../application/use-cases/agenda/ObtenerDisponibilidad');
const AgendaRepository = require('../../infrastructure/repositories/AgendaRepository');
const CitaRepository = require('../../infrastructure/repositories/CitaRepository');
const CiudadRepository = require('../../infrastructure/repositories/CiudadRepository');

const agendaRepository = new AgendaRepository();
const citaRepository = new CitaRepository();
const ciudadRepository = new CiudadRepository();

class AgendaController {
  async listar(req, res) {
    try {
      const { ciudadId } = req.query;
      if (!ciudadId) {
        return res.status(400).json({ mensaje: 'ciudadId es requerido' });
      }
      const agendas = await agendaRepository.findByCiudad(parseInt(ciudadId));
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
          mensaje: 'Hora inicio, hora fin y ciudad son requeridos'
        });
      }
      const useCase = new CrearAgenda(agendaRepository, ciudadRepository);
      const resultado = await useCase.execute({
        fecha, diasSemana, horaInicio, horaFin, intervalo, ciudadId
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
          mensaje: 'ciudadId y fecha son requeridos'
        });
      }
      const useCase = new ObtenerDisponibilidad(agendaRepository, citaRepository);
      const resultado = await useCase.execute(parseInt(ciudadId), fecha);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await agendaRepository.delete(parseInt(id));
      return res.status(200).json({ mensaje: 'Agenda eliminada correctamente' });
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = new AgendaController();