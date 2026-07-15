const admin = require('firebase-admin');

class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      const serviceAccount = FirebaseService._cargarCredenciales();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  // En producción (Railway) las credenciales llegan en base64 por variable de
  // entorno, porque el .json está en .gitignore y no existe en el servidor.
  // En desarrollo local se sigue usando el archivo firebase-credentials.json.
  static _cargarCredenciales() {
    if (process.env.FIREBASE_CREDENTIALS_BASE64) {
      const json = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf8');
      return JSON.parse(json);
    }
    return require('./firebase-credentials.json');
  }

  // Enviar notificación a un token específico
  async enviarNotificacion({ token, titulo, cuerpo, datos }) {
    try {
      const mensaje = {
        token,
        notification: {
          title: titulo,
          body: cuerpo,
        },
        data: datos || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      };
      const response = await admin.messaging().send(mensaje);
      return response;
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  // Enviar notificación a múltiples tokens
  async enviarNotificacionMultiple({ tokens, titulo, cuerpo, datos }) {
    try {
      if (!tokens || tokens.length === 0) return;
      const mensaje = {
        notification: { title: titulo, body: cuerpo },
        data: datos || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        tokens,
      };
      const response = await admin.messaging().sendEachForMulticast(mensaje);
      return response;
    } catch (error) {
      console.error('Error enviando notificaciones múltiples:', error);
    }
  }
}

module.exports = new FirebaseService();