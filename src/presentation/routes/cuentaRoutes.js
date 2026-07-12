const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const ctrl = controllers.cuentaController;

router.use(authMiddleware);

// Resumen de saldos por ciudad
router.get('/resumen',    ctrl.obtenerResumen.bind(ctrl));

// Historial combinado de movimientos
router.get('/historial',  ctrl.obtenerHistorial.bind(ctrl));

// Saldo inicial por ciudad
router.get('/saldo-inicial/:ciudadId',  ctrl.getSaldoInicial.bind(ctrl));
router.put('/saldo-inicial/:ciudadId',  ctrl.upsertSaldoInicial.bind(ctrl));

// Movimientos extra (ingresos/gastos no vinculados a pacientes)
router.get('/movimientos',       ctrl.listarMovimientos.bind(ctrl));
router.post('/movimientos',      ctrl.registrarMovimiento.bind(ctrl));
router.delete('/movimientos/:id', ctrl.eliminarMovimiento.bind(ctrl));

// Traspasos entre efectivo y banco
router.post('/traspasos',        ctrl.registrarTraspaso.bind(ctrl));
router.delete('/traspasos/:id',  ctrl.eliminarTraspaso.bind(ctrl));

module.exports = router;
