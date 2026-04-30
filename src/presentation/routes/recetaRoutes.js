const express = require('express');
const router = express.Router();
const RecetaController = require('../controllers/RecetaController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.post('/', RecetaController.generar);
router.get('/cita/:citaId', RecetaController.obtenerByCita);
router.get('/cita/:citaId/whatsapp', RecetaController.obtenerWhatsappLink);

module.exports = router;