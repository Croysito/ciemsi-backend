const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/PacienteController');
const PacienteRepository = require('../../infrastructure/repositories/PacienteRepository');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

const pacienteRepository = new PacienteRepository();

router.use(authMiddleware);

router.get('/', PacienteController.listar);

router.get('/mi-perfil', async (req, res) => {
  try {
    const usuarioId = parseInt(req.usuario.id);
    const paciente = await pacienteRepository.findByUsuarioId(usuarioId);
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }
    return res.status(200).json(paciente);
  } catch (error) {
    return res.status(500).json({ mensaje: error.message });
  }
});

router.get('/:id', PacienteController.obtener);
router.post('/', PacienteController.registrar);
router.put('/:id', PacienteController.modificar);

module.exports = router;