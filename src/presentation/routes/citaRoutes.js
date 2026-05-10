const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const CitaController = controllers.citaController;

router.use(authMiddleware);

router.get('/', CitaController.listar.bind(CitaController));
router.post('/', CitaController.reservar.bind(CitaController));
router.put('/:id', CitaController.modificar.bind(CitaController));
router.patch('/:id/estado', CitaController.cambiarEstado.bind(CitaController));

module.exports = router;
