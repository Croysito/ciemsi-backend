const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const DeudaController = controllers.deudaController;

router.use(authMiddleware);

router.get('/', DeudaController.listar.bind(DeudaController));
router.get('/resumen-pendientes', DeudaController.resumenPendientes.bind(DeudaController));

module.exports = router;
