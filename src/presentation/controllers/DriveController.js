const SubirArchivoDrive = require('../../application/use-cases/historial/SubirArchivoDrive');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

class DriveController {
  constructor({ historialRepository, driveService }) {
    this.driveService = driveService;
    this.subirArchivoDrive = new SubirArchivoDrive(historialRepository, driveService);
  }

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

      const resultado = await this.subirArchivoDrive.execute({
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
      const url = this.driveService.getAuthUrl();
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
      const tokens = await this.driveService.getTokens(code);
      return res.status(200).json({ tokens });
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = DriveController;
