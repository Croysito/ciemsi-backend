const RegistrarCobroDeuda = require('../../application/use-cases/pagos/RegistrarCobroDeuda');
const RegistrarVentaProducto = require('../../application/use-cases/pagos/RegistrarVentaProducto');
const ObtenerIngreso = require('../../application/use-cases/pagos/ObtenerIngreso');
const ListarIngresosPaciente = require('../../application/use-cases/pagos/ListarIngresosPaciente');
const ObtenerEstadoCuenta = require('../../application/use-cases/pagos/ObtenerEstadoCuenta');

class IngresoController {
  constructor({ ingresoRepository, deudaRepository, productoRepository }) {
    this.registrarCobroDeuda = new RegistrarCobroDeuda(ingresoRepository, deudaRepository);
    this.registrarVentaProducto = new RegistrarVentaProducto(ingresoRepository, productoRepository);
    this.obtenerIngreso = new ObtenerIngreso(ingresoRepository);
    this.listarIngresosPaciente = new ListarIngresosPaciente(ingresoRepository);
    this.obtenerEstadoCuenta = new ObtenerEstadoCuenta(ingresoRepository, deudaRepository);
  }

  async listar(req, res) {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId) return res.status(400).json({ mensaje: 'pacienteId es requerido' });
      const ingresos = await this.listarIngresosPaciente.execute(parseInt(pacienteId));
      return res.status(200).json(ingresos);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtener(req, res) {
    try {
      const ingreso = await this.obtenerIngreso.execute(parseInt(req.params.id));
      return res.status(200).json(ingreso);
    } catch (error) {
      return res.status(404).json({ mensaje: error.message });
    }
  }

  async cobrarDeuda(req, res) {
    try {
      const { deudaId, pacienteId, ciudadId, monto, metodo, notas } = req.body;
      const createdBy = req.usuario.id;
      const resultado = await this.registrarCobroDeuda.execute({
        deudaId: parseInt(deudaId),
        pacienteId: parseInt(pacienteId),
        ciudadId: parseInt(ciudadId),
        monto: Number(monto),
        metodo,
        notas,
        createdBy,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async venderProducto(req, res) {
    try {
      const { pacienteId, ciudadId, items, metodo, notas } = req.body;
      const createdBy = req.usuario.id;
      const resultado = await this.registrarVentaProducto.execute({
        pacienteId: parseInt(pacienteId),
        ciudadId: parseInt(ciudadId),
        items,
        metodo,
        notas,
        createdBy,
      });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async estadoCuenta(req, res) {
    try {
      const pacienteId = parseInt(req.params.pacienteId);
      const estado = await this.obtenerEstadoCuenta.execute(pacienteId);
      return res.status(200).json(estado);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = IngresoController;
