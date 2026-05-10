const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const AgendaController = controllers.agendaController;

router.use(authMiddleware);

router.get('/', AgendaController.listar.bind(AgendaController));
router.get('/disponibilidad', AgendaController.disponibilidad.bind(AgendaController));
router.post('/', AgendaController.crear.bind(AgendaController));
router.patch('/:id/estado', AgendaController.cambiarEstado.bind(AgendaController));
router.delete('/:id', AgendaController.eliminar.bind(AgendaController));

module.exports = router;
