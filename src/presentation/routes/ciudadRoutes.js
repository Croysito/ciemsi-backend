const express = require('express');
const router = express.Router();
const CiudadController = require('../controllers/CiudadController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', CiudadController.listar);

module.exports = router;