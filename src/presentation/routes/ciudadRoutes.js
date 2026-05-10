const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const CiudadController = controllers.ciudadController;

router.use(authMiddleware);

router.get('/', CiudadController.listar.bind(CiudadController));

module.exports = router;
