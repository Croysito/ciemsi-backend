const express = require('express');
const router = express.Router();
const AsistenteController = require('../controllers/AsistenteController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

// Solo Doctora puede gestionar asistentes
router.get('/', AsistenteController.listar);
router.post('/', AsistenteController.crear);
router.put('/:id', AsistenteController.modificar);
router.patch('/:id/estado', AsistenteController.cambiarEstado);

// Cualquier usuario autenticado puede cambiar su password
router.post('/cambiar-password', AsistenteController.cambiarPassword);

module.exports = router;