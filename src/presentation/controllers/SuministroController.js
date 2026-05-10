const ListarSuministros = require('../../application/use-cases/suministros/ListarSuministros');
const CrearSuministro = require('../../application/use-cases/suministros/CrearSuministro');
const ModificarSuministro = require('../../application/use-cases/suministros/ModificarSuministro');
const ObtenerInventario = require('../../application/use-cases/suministros/ObtenerInventario');
const VerificarAlertas = require('../../application/use-cases/suministros/VerificarAlertas');

class SuministroController {
  constructor({ suministroRepository }) {
    this.listarSuministros = new ListarSuministros(suministroRepository);
    this.crearSuministro = new CrearSuministro(suministroRepository);
    this.modificarSuministro = new ModificarSuministro(suministroRepository);
    this.obtenerInventario = new ObtenerInventario(suministroRepository);
    this.verificarAlertas = new VerificarAlertas(suministroRepository);
  }

  async listar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const suministros = await this.listarSuministros.execute(req.query.tipo);
      return res.status(200).json(suministros);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async crear(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const { nombreSuministro, unidadMedida, marca, tipo, umbral } = req.body;
      const resultado = await this.crearSuministro.execute({
        nombreSuministro, unidadMedida, marca, tipo, umbral,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async modificar(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const resultado = await this.modificarSuministro.execute(parseInt(req.params.id), req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async inventario(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const resultado = await this.obtenerInventario.execute(parseInt(req.query.ciudadId));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async alertas(req, res) {
    try {
      if (req.usuario?.rol === 'Paciente') return res.status(403).json({ mensaje: 'No autorizado' });
      const resultado = await this.verificarAlertas.execute(parseInt(req.query.ciudadId));
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = SuministroController;
