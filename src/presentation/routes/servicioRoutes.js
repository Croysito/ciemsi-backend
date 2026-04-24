const express = require('express');
const router = express.Router();
const ServicioController = require('../controllers/ServicioController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', ServicioController.listar);
router.post('/', ServicioController.crear);
router.put('/:id', ServicioController.modificar);

module.exports = router;