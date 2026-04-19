const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

// Rutas públicas (no requieren token)
router.post('/login', AuthController.iniciarSesion);
router.post('/recuperar-contrasena', AuthController.recuperarContrasena);

// Rutas protegidas (requieren token)
router.post('/logout', authMiddleware, AuthController.cerrarSesion);

module.exports = router;