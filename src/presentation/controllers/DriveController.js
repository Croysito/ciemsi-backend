const SubirArchivoDrive = require('../../application/use-cases/historial/SubirArchivoDrive');
const HistorialRepository = require('../../infrastructure/repositories/HistorialRepository');
const GoogleDriveService = require('../../infrastructure/services/GoogleDriveService');
const multer = require('multer');

const historialRepository = new HistorialRepository();
const driveService = new GoogleDriveService();

// Multer en memoria (no guarda en disco)
const upload = multer({ storage: multer.memoryStorage() });

class DriveController {
  // Middleware de multer para usar en la ruta
  getUploadMiddleware() {
    return upload.single('archivo');
  }

  async subirArchivo(req, res) {
    try {
      const { notaId } = req.params;
      const { tipo } = req.body;
      const tokens = JSON.parse(req.body.tokens);

      if (!req.file) {
        return res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
      }

      if (!tipo) {
        return res.status(400).json({ mensaje: 'El tipo es requerido' });
      }

      const useCase = new SubirArchivoDrive(historialRepository);
      const resultado = await useCase.execute({
        notaId: parseInt(notaId),
        nombre: req.file.originalname,
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
        tipo: tipo.toUpperCase(),
        tokens,
      });

      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async obtenerAuthUrl(req, res) {
    try {
      const url = driveService.getAuthUrl();
      return res.status(200).json({ url });
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async intercambiarTokens(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ mensaje: 'El código es requerido' });
      }
      const tokens = await driveService.getTokens(code);
      return res.status(200).json({ tokens });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = new DriveController();