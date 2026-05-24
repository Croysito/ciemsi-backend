const express = require('express');
const router = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const ProductoController = controllers.productoController;

router.use(authMiddleware);

router.get('/', ProductoController.listar.bind(ProductoController));
router.get('/compras', ProductoController.listarCompras.bind(ProductoController));
router.get('/inventario/:ciudadId', ProductoController.inventario.bind(ProductoController));
router.post('/', ProductoController.crear.bind(ProductoController));
router.put('/:id', ProductoController.modificar.bind(ProductoController));
router.patch('/:id/estado', ProductoController.cambiarEstado.bind(ProductoController));
router.post('/compras', ProductoController.registrarCompraProducto.bind(ProductoController));

module.exports = router;
