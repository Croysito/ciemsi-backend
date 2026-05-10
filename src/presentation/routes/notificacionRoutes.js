const express = require('express');
const router = express.Router();
const { repositories, authMiddleware } = require('../../main/container');

const { usuarioRepository } = repositories;

router.use(authMiddleware);

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
