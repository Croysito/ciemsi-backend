const ListarDeudasPaciente = require('../../application/use-cases/pagos/ListarDeudasPaciente');

class DeudaController {
  constructor({ deudaRepository }) {
    this.listarDeudasPaciente = new ListarDeudasPaciente(deudaRepository);
    this.deudaRepository = deudaRepository;
  }

  async listar(req, res) {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId) return res.status(400).json({ mensaje: 'pacienteId es requerido' });
      const deudas = await this.listarDeudasPaciente.execute(parseInt(pacienteId));
      return res.status(200).json(deudas);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async resumenPendientes(req, res) {
    try {
      const resumen = await this.deudaRepository.resumenPendientesPorPaciente();
      return res.status(200).json(resumen);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = DeudaController;
