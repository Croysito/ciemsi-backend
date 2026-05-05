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

    // 2. Obtener nombre del paciente para nombrar la carpeta
    const paciente = await this.historialRepository.getPacienteByNotaId(notaId);
    const carpetaPaciente = paciente
      ? `${paciente.apellido}_${paciente.nombre}`.replace(/\s+/g, '_')
      : 'sin_paciente';

    // 3. Subir archivo a Drive dentro de la carpeta del paciente
    const archivoSubido = await this.driveService.uploadFile({
      nombre,
      mimeType,
      buffer,
      tokens,
      carpetaPaciente,
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