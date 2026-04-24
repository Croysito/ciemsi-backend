const express = require('express');
const router = express.Router();
const AgendaController = require('../controllers/AgendaController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', AgendaController.listar);
router.get('/disponibilidad', AgendaController.disponibilidad);
router.post('/', AgendaController.crear);
router.delete('/:id', AgendaController.eliminar);

module.exports = router;