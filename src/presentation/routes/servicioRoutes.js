const express = require('express');
const router = express.Router();
const ServicioController = require('../controllers/ServicioController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', ServicioController.listar);
router.get('/por-rol', ServicioController.listarPorRol);
router.post('/', ServicioController.crear);
router.put('/:id', ServicioController.modificar);

module.exports = router;