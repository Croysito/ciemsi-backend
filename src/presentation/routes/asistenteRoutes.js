const express = require('express');
const router = express.Router();
const { controllers, repositories, authMiddleware } = require('../../main/container');

const AsistenteController = controllers.asistenteController;
const { usuarioRepository } = repositories;

router.use(authMiddleware);

// Solo Doctora puede gestionar asistentes
router.get('/', AsistenteController.listar.bind(AsistenteController));
router.post('/', AsistenteController.crear.bind(AsistenteController));
router.put('/:id', AsistenteController.modificar.bind(AsistenteController));
router.patch('/:id/estado', AsistenteController.cambiarEstado.bind(AsistenteController));

// Cualquier usuario autenticado puede cambiar su password
router.post('/cambiar-password', AsistenteController.cambiarPassword.bind(AsistenteController));

router.post('/fcm-token', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const usuarioId = req.usuario.id;
    await usuarioRepository.updateFcmToken(usuarioId, fcmToken);
    return res.status(200).json({ mensaje: 'Token FCM actualizado' });
  } catch (error) {
    return res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;
