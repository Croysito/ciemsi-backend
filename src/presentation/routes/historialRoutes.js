const express = require('express');
const router = express.Router();
const HistorialController = require('../controllers/HistorialController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

// Todas las rutas de historial requieren autenticación
router.use(authMiddleware);

router.post('/notas/:notaId/links', HistorialController.agregarLink);
router.get('/notas/:notaId/links', HistorialController.obtenerLinksPorTipo);
router.get('/:pacienteId', HistorialController.obtener);
router.post('/:pacienteId/notas', HistorialController.agregarNota);


module.exports = router;