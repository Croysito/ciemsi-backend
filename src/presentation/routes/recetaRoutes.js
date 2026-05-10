const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const RecetaController = controllers.recetaController;

router.use(authMiddleware);

router.post('/', RecetaController.generar.bind(RecetaController));
router.get('/cita/:citaId', RecetaController.obtenerByCita.bind(RecetaController));
router.get('/cita/:citaId/whatsapp', RecetaController.obtenerWhatsappLink.bind(RecetaController));

module.exports = router;
