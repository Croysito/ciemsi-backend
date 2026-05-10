const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const PacienteController = controllers.pacienteController;

router.use(authMiddleware);

router.get('/', PacienteController.listar.bind(PacienteController));

router.get('/mi-perfil', PacienteController.miPerfil.bind(PacienteController));

router.post('/provisional', PacienteController.registrarProvisional.bind(PacienteController));
router.post('/', PacienteController.registrar.bind(PacienteController));
router.get('/:id', PacienteController.obtener.bind(PacienteController));
router.put('/:id/completar', PacienteController.completar.bind(PacienteController));
router.put('/:id', PacienteController.modificar.bind(PacienteController));

module.exports = router;
