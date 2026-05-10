const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const DriveController = controllers.driveController;

router.use(authMiddleware);

// Obtener URL de autorización Google
router.get('/auth-url', DriveController.obtenerAuthUrl.bind(DriveController));

// Intercambiar código por tokens
router.post('/tokens', DriveController.intercambiarTokens.bind(DriveController));

// Subir archivo a Drive y guardar link
router.post(
  '/upload/:notaId',
  DriveController.getUploadMiddleware(),
  DriveController.subirArchivo.bind(DriveController)
);

module.exports = router;
