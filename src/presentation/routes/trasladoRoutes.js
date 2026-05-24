const express = require('express');
const router  = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const ctrl = controllers.trasladoController;

router.use(authMiddleware);

router.get('/',              ctrl.listar.bind(ctrl));
router.get('/stock',         ctrl.stock.bind(ctrl));
router.post('/',             ctrl.crear.bind(ctrl));
router.patch('/:id/confirmar', ctrl.confirmar.bind(ctrl));
router.patch('/:id/devolver',  ctrl.devolver.bind(ctrl));

module.exports = router;
