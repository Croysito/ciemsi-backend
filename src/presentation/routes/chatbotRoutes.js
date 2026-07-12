const express = require('express');
const { controllers, authMiddleware } = require('../../main/container');

const router = express.Router();
router.use(authMiddleware);

router.post('/tts',       (req, res) => controllers.chatbotController.tts(req, res));
router.get ('/estado',    (req, res) => controllers.chatbotController.estado(req, res));
router.post('/chat',      (req, res) => controllers.chatbotController.chat(req, res));
router.post('/finalizar', (req, res) => controllers.chatbotController.finalizar(req, res));

module.exports = router;
