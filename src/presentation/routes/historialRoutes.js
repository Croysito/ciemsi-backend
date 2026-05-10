const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const HistorialController = controllers.historialController;

// Todas las rutas de historial requieren autenticación
router.use(authMiddleware);

router.get('/mi-historial', authMiddleware, HistorialController.miHistorial.bind(HistorialController));
router.post('/notas/:notaId/links', HistorialController.agregarLink.bind(HistorialController));
router.get('/notas/:notaId/links', HistorialController.obtenerLinksPorTipo.bind(HistorialController));
router.get('/:pacienteId', HistorialController.obtener.bind(HistorialController));
router.post('/:pacienteId/notas', HistorialController.agregarNota.bind(HistorialController));



module.exports = router;
