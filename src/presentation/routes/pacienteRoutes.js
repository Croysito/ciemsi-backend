const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/PacienteController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

// Todas las rutas de pacientes requieren autenticación
router.use(authMiddleware);

router.get('/', PacienteController.listar);
router.get('/:id', PacienteController.obtener);
router.post('/', PacienteController.registrar);
router.put('/:id', PacienteController.modificar);

module.exports = router;