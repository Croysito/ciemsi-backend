const ListarTratamientos = require('../../application/use-cases/tratamientos/ListarTratamientos');
const CrearTratamiento = require('../../application/use-cases/tratamientos/CrearTratamiento');
const AsignarTratamiento = require('../../application/use-cases/tratamientos/AsignarTratamiento');
const AgregarSupministroAsistente = require('../../application/use-cases/tratamientos/AgregarSupministroAsistente');
const CompletarTratamiento = require('../../application/use-cases/tratamientos/CompletarTratamiento');
const CambiarEstadoTratamientoAsignado = require('../../application/use-cases/tratamientos/CambiarEstadoTratamientoAsignado');

class TratamientoController {
  constructor({
    tratamientoRepository,
    citaRepository,
    suministroRepository,
    pacienteRepository,
    notificacionService,
  }) {
    this.tratamientoRepository = tratamientoRepository;
    this.citaRepository = citaRepository;
    this.pacienteRepository = pacienteRepository;
    this.listarTratamientos = new ListarTratamientos(tratamientoRepository);
    this.crearTratamiento = new CrearTratamiento(tratamientoRepository, suministroRepository);
    this.asignarTratamiento = new AsignarTratamiento(
      tratamientoRepository, citaRepository, suministroRepository, notificacionService
    );
    this.agregarSupministroAsistente = new AgregarSupministroAsistente(
      tratamientoRepository, suministroRepository
    );
    this.completarTratamiento = new CompletarTratamiento(
      tratamientoRepository, notificacionService
    );
    this.cambiarEstadoTratamientoAsignado = new CambiarEstadoTratamientoAsignado(
      tratamientoRepository
    );
  }

  async listar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const tratamientos = await this.listarTratamientos.execute();
      return res.status(200).json(tratamientos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const { nombreTratamiento, detalle, precioBase, medicamentosBase } = req.body;
      const resultado = await this.crearTratamiento.execute({
        nombreTratamiento, detalle, precioBase, medicamentosBase,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      await this.tratamientoRepository.update(parseInt(req.params.id), req.body);
      return res.status(200).json({ mensaje: 'Tratamiento actualizado correctamente' });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async asignar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const { tratamientoId, citaId, precio, medicamentos } = req.body;
      if (!tratamientoId || !citaId) {
        return res.status(400).json({ mensaje: 'Tratamiento y cita son requeridos' });
      }
      const resultado = await this.asignarTratamiento.execute({
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
        const paciente = await this.pacienteRepository.findByUsuarioId(id);
        if (!paciente) return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        tratamientos = await this.tratamientoRepository.findAsignadosByPaciente(paciente.id);
        tratamientos = tratamientos.map(({ suministros, ...tratamiento }) => ({
          ...tratamiento,
          suministros: [],
        }));
      } else if (rol === 'Asistente' && ciudadId) {
        tratamientos = await this.tratamientoRepository.findAsignadosByCiudad(parseInt(ciudadId));
      } else {
        tratamientos = await this.tratamientoRepository.findAsignados();
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
        const cita = await this.citaRepository.findById(parseInt(citaId));
        if (!cita || cita.paciente.usuario.id !== req.usuario.id) {
          return res.status(403).json({ mensaje: 'No autorizado' });
        }
      }
      const tratamientos = await this.tratamientoRepository.findAsignadosByCita(parseInt(citaId));
      return res.status(200).json(tratamientos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async agregarSupministro(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const { id } = req.params;
      const { suministroId, cantidad } = req.body;
      if (!suministroId || !cantidad) {
        return res.status(400).json({ mensaje: 'Suministro y cantidad son requeridos' });
      }
      const resultado = await this.agregarSupministroAsistente.execute({
        tratamientoAsignadoId: parseInt(id),
        suministroId: parseInt(suministroId),
        cantidad: parseFloat(cantidad),
      });
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async completar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const resultado = await this.completarTratamiento.execute(parseInt(req.params.id));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async cambiarEstadoAsignado(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ mensaje: 'El estado es requerido' });
      const resultado = await this.cambiarEstadoTratamientoAsignado.execute(
        parseInt(req.params.id), estado
      );
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = TratamientoController;
