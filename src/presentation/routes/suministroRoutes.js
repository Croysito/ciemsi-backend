const express = require('express');
const router = express.Router();
const SuministroController = require('../controllers/SuministroController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', SuministroController.listar);
router.get('/inventario', SuministroController.inventario);
router.get('/alertas', SuministroController.alertas);
router.post('/', SuministroController.crear);
router.put('/:id', SuministroController.modificar);

module.exports = router;