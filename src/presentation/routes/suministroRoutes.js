const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const SuministroController = controllers.suministroController;

router.use(authMiddleware);

router.get('/', SuministroController.listar.bind(SuministroController));
router.get('/inventario', SuministroController.inventario.bind(SuministroController));
router.get('/alertas', SuministroController.alertas.bind(SuministroController));
router.post('/', SuministroController.crear.bind(SuministroController));
router.put('/:id', SuministroController.modificar.bind(SuministroController));

module.exports = router;
