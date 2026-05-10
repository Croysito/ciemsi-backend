const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const TratamientoController = controllers.tratamientoController;

router.use(authMiddleware);

router.get('/', TratamientoController.listar.bind(TratamientoController));
router.get('/asignados', TratamientoController.listarAsignados.bind(TratamientoController));
router.get('/asignados/cita/:citaId', TratamientoController.obtenerAsignadosByCita.bind(TratamientoController));
router.post('/', TratamientoController.crear.bind(TratamientoController));
router.put('/:id', TratamientoController.modificar.bind(TratamientoController));
router.post('/asignar', TratamientoController.asignar.bind(TratamientoController));
router.post('/asignados/:id/suministro', TratamientoController.agregarSupministro.bind(TratamientoController));
router.patch('/asignados/:id/estado', TratamientoController.cambiarEstadoAsignado.bind(TratamientoController));
router.patch('/asignados/:id/completar', TratamientoController.completar.bind(TratamientoController));

module.exports = router;
