const GoogleDriveService = require('../../../infrastructure/services/GoogleDriveService');

class SubirArchivoDrive {
  constructor(historialRepository) {
    this.historialRepository = historialRepository;
    this.driveService = new GoogleDriveService();
  }

  async execute({ notaId, nombre, mimeType, buffer, tipo, tokens }) {
    // 1. Validar tipo
    const tiposValidos = ['IMAGEN', 'VIDEO', 'DRIVE'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo no válido. Use: IMAGEN, VIDEO o DRIVE');
    }

    // 2. Subir archivo a Drive
    const archivoSubido = await this.driveService.uploadFile({
      nombre,
      mimeType,
      buffer,
      tokens,
    });

    // 3. Guardar el link en la BD
    const nuevoLink = await this.historialRepository.addLink({
      nombre: archivoSubido.nombre,
      link: archivoSubido.link,
      tipo,
      notaId,
    });

    return {
      mensaje: 'Archivo subido correctamente a Google Drive',
      link: nuevoLink,
    };
  }
}

module.exports = SubirArchivoDrive;