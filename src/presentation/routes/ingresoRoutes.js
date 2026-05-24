const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const IngresoController = controllers.ingresoController;

router.use(authMiddleware);

router.get('/', IngresoController.listar.bind(IngresoController));
router.get('/estado-cuenta/:pacienteId', IngresoController.estadoCuenta.bind(IngresoController));
router.get('/:id', IngresoController.obtener.bind(IngresoController));
router.post('/cobro-deuda', IngresoController.cobrarDeuda.bind(IngresoController));
router.post('/venta-producto', IngresoController.venderProducto.bind(IngresoController));

module.exports = router;
