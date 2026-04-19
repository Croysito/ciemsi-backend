const express = require('express');
const router = express.Router();
const DriveController = require('../controllers/DriveController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

// Obtener URL de autorización Google
router.get('/auth-url', DriveController.obtenerAuthUrl);

// Intercambiar código por tokens
router.post('/tokens', DriveController.intercambiarTokens);

// Subir archivo a Drive y guardar link
router.post(
  '/upload/:notaId',
  DriveController.getUploadMiddleware(),
  DriveController.subirArchivo
);

module.exports = router;