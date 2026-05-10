const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const ServicioController = controllers.servicioController;

router.use(authMiddleware);

router.get('/', ServicioController.listar.bind(ServicioController));
router.get('/por-rol', ServicioController.listarPorRol.bind(ServicioController));
router.post('/', ServicioController.crear.bind(ServicioController));
router.put('/:id', ServicioController.modificar.bind(ServicioController));

module.exports = router;
