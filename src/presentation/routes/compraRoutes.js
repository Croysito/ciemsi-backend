const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const CompraController = controllers.compraController;

router.use(authMiddleware);

router.get('/', CompraController.listar.bind(CompraController));
router.get('/:id', CompraController.obtener.bind(CompraController));
router.post('/', CompraController.registrar.bind(CompraController));

module.exports = router;
