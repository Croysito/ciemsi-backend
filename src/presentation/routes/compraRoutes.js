const express = require('express');
const router = express.Router();
const CompraController = require('../controllers/CompraController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', CompraController.listar);
router.get('/:id', CompraController.obtener);
router.post('/', CompraController.registrar);

module.exports = router;