const express = require('express');
const router = express.Router();
const TratamientoController = require('../controllers/TratamientoController');
const authMiddleware = require('../../infrastructure/services/AuthMiddleware');

router.use(authMiddleware);

router.get('/', TratamientoController.listar);
router.get('/asignados', TratamientoController.listarAsignados);
router.get('/asignados/cita/:citaId', TratamientoController.obtenerAsignadosByCita);
router.post('/', TratamientoController.crear);
router.put('/:id', TratamientoController.modificar);
router.post('/asignar', TratamientoController.asignar);
router.post('/asignados/:id/suministro', TratamientoController.agregarSupministro);
router.patch('/asignados/:id/estado', TratamientoController.cambiarEstadoAsignado);
router.patch('/asignados/:id/completar', TratamientoController.completar);

module.exports = router;
