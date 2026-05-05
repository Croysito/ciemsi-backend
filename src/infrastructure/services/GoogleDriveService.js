const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage' // para apps móviles
    );
  }

  // Configura el token del usuario autenticado
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Obtener URL de autorización (primer login con Google)
  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
      ],
    });
  }

  // Intercambiar código por tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Busca una subcarpeta por nombre dentro de parentId; si no existe, la crea
  async findOrCreateFolder(drive, folderName, parentId) {
    const sanitized = folderName.replace(/'/g, "\\'");
    const listResponse = await drive.files.list({
      q: `name='${sanitized}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (listResponse.data.files.length > 0) {
      return listResponse.data.files[0].id;
    }

    const createResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
    });

    return createResponse.data.id;
  }

  // Subir archivo a Drive dentro de la subcarpeta del paciente
  async uploadFile({ nombre, mimeType, buffer, tokens, carpetaPaciente }) {
    this.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    // Obtener o crear la carpeta del paciente dentro de la carpeta raíz
    const folderId = await this.findOrCreateFolder(
      drive,
      carpetaPaciente,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: nombre,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: bufferStream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    // Hacer el archivo accesible con el link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId: response.data.id,
      nombre: response.data.name,
      link: response.data.webViewLink,
    };
  }
}

module.exports = GoogleDriveService;