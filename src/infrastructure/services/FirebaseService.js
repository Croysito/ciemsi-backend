const admin = require('firebase-admin');
const path = require('path');

class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      const serviceAccount = require('./firebase-credentials.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
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