const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { controllers, authMiddleware } = require('../../main/container');

const CitaController = controllers.citaController;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

router.get('/',                    CitaController.listar.bind(CitaController));
router.post('/',                   CitaController.reservar.bind(CitaController));
router.put('/:id',                 CitaController.modificar.bind(CitaController));
router.patch('/:id/estado',        CitaController.cambiarEstado.bind(CitaController));

// Adelanto / comprobante
router.post('/:id/comprobante',    upload.single('comprobante'), CitaController.subirComprobante.bind(CitaController));
router.get('/:id/comprobante',     CitaController.obtenerComprobante.bind(CitaController));
router.post('/:id/confirmar-pago', CitaController.confirmarPago.bind(CitaController));

// Configuración QR (solo Doctora)
router.get('/config/qr-pago',      CitaController.obtenerQrPago.bind(CitaController));
router.put('/config/qr-pago',      CitaController.actualizarQrPago.bind(CitaController));

module.exports = router;
