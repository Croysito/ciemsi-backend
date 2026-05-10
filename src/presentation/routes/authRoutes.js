const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const AuthController = controllers.authController;

// Rutas públicas (no requieren token)
router.post('/login', AuthController.iniciarSesion.bind(AuthController));
router.post('/recuperar-contrasena', AuthController.recuperarContrasena.bind(AuthController));

// Rutas protegidas (requieren token)
router.post('/logout', authMiddleware, AuthController.cerrarSesion.bind(AuthController));

module.exports = router;
