const RegistrarMovimientoExtra = require('../../application/use-cases/cuentas/RegistrarMovimientoExtra');
const ListarMovimientosExtra   = require('../../application/use-cases/cuentas/ListarMovimientosExtra');
const ObtenerResumenCuentas    = require('../../application/use-cases/cuentas/ObtenerResumenCuentas');
const ObtenerResumenMensual    = require('../../application/use-cases/cuentas/ObtenerResumenMensual');
const SetSaldoInicial          = require('../../application/use-cases/cuentas/SetSaldoInicial');
const ObtenerHistorialMovimientos = require('../../application/use-cases/cuentas/ObtenerHistorialMovimientos');

class CuentaController {
  constructor({ movimientoExtraRepository, saldoInicialRepository, cuentaRepository, ciudadRepository, traspasoRepository }) {
    this.registrar        = new RegistrarMovimientoExtra(movimientoExtraRepository);
    this.listar           = new ListarMovimientosExtra(movimientoExtraRepository);
    this.resumen          = new ObtenerResumenCuentas(cuentaRepository, ciudadRepository);
    this.resumenMensual   = new ObtenerResumenMensual(cuentaRepository, ciudadRepository);
    this.setSaldo         = new SetSaldoInicial(saldoInicialRepository);
    this.historial        = new ObtenerHistorialMovimientos(cuentaRepository);
    this.saldoRepo        = saldoInicialRepository;
    this.movimientoExtraRepo = movimientoExtraRepository;
    this.traspasoRepo     = traspasoRepository;
  }

  async registrarMovimiento(req, res) {
    try {
      const { tipo, categoria, descripcion, monto, metodo, ciudadId } = req.body;
      const usuarioId = req.usuario.id;
      const resultado = await this.registrar.execute({
        tipo, categoria, descripcion, monto, metodo,
        ciudadId: parseInt(ciudadId), usuarioId,
      });
      return res.status(201).json(resultado);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async listarMovimientos(req, res) {
    try {
      const { ciudadId, tipo, fechaDesde, fechaHasta } = req.query;
      const items = await this.listar.execute({ ciudadId: parseInt(ciudadId), tipo, fechaDesde, fechaHasta });
      return res.status(200).json(items);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async eliminarMovimiento(req, res) {
    try {
      const { id } = req.params;
      await this.movimientoExtraRepo.deleteById(parseInt(id));
      return res.status(200).json({ mensaje: 'Eliminado' });
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async obtenerResumen(req, res) {
    try {
      const { ciudadId } = req.query;
      const datos = await this.resumen.execute(ciudadId ? parseInt(ciudadId) : null);
      return res.status(200).json(datos);
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async obtenerResumenMensual(req, res) {
    try {
      const { ciudadId, anio, mes } = req.query;
      if (!ciudadId || !anio || !mes) {
        return res.status(400).json({ mensaje: 'ciudadId, anio y mes son requeridos' });
      }
      const datos = await this.resumenMensual.execute(parseInt(ciudadId), parseInt(anio), parseInt(mes));
      return res.status(200).json(datos);
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async obtenerHistorial(req, res) {
    try {
      const { ciudadId, fechaDesde, fechaHasta, tipo } = req.query;
      const datos = await this.historial.execute({ ciudadId, fechaDesde, fechaHasta, tipo });
      return res.status(200).json(datos);
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async getSaldoInicial(req, res) {
    try {
      const { ciudadId } = req.params;
      const datos = await this.saldoRepo.findByCiudad(parseInt(ciudadId));
      return res.status(200).json(datos);
    } catch (e) {
      return res.status(500).json({ mensaje: e.message });
    }
  }

  async registrarTraspaso(req, res) {
    try {
      const { tipo, monto, descripcion, ciudadId } = req.body;
      if (!['efectivo_a_banco', 'banco_a_efectivo'].includes(tipo)) {
        return res.status(400).json({ mensaje: 'tipo inválido' });
      }
      const usuarioId = req.usuario.id;
      const resultado = await this.traspasoRepo.registrar({
        ciudadId: parseInt(ciudadId),
        tipo,
        monto: parseFloat(monto),
        descripcion,
        usuarioId,
      });
      return res.status(201).json(resultado);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async eliminarTraspaso(req, res) {
    try {
      const { id } = req.params;
      await this.traspasoRepo.eliminar(parseInt(id));
      return res.status(200).json({ mensaje: 'Eliminado' });
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }

  async upsertSaldoInicial(req, res) {
    try {
      const { ciudadId } = req.params;
      const { tipo, monto } = req.body;
      const updatedBy = req.usuario.id;
      const datos = await this.setSaldo.execute({ ciudadId: parseInt(ciudadId), tipo, monto, updatedBy });
      return res.status(200).json(datos);
    } catch (e) {
      return res.status(400).json({ mensaje: e.message });
    }
  }
}

module.exports = CuentaController;
