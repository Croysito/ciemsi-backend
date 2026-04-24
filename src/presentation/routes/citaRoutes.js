const express = require('express');
const router = express.Router();
const CitaController = require('../controllers/CitaController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', CitaController.listar);
router.post('/', CitaController.reservar);
router.put('/:id', CitaController.modificar);
router.patch('/:id/estado', CitaController.cambiarEstado);

module.exports = router;