const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = (nombre, ciudad) => `
Eres un asistente médico virtual amigable de la clínica CIEMSI, ubicada en ${ciudad || 'Bolivia'}.
Estás hablando con el paciente ${nombre}.

Tu objetivo es recopilar la historia clínica de manera conversacional, empática y natural.
Haz 1 o 2 preguntas a la vez, nunca más. Adapta el orden según las respuestas del paciente.

Temas que debes cubrir (si no tienes la info o está desactualizada):
1. Datos personales básicos: CI, teléfono, fecha de nacimiento
2. Motivo de consulta actual: ¿qué lo trae hoy? ¿síntomas? ¿desde cuándo? ¿intensidad?
3. Antecedentes médicos: enfermedades previas, cirugías, hospitalizaciones
4. Alergias: medicamentos, alimentos, materiales
5. Medicamentos actuales: qué toma, dosis, frecuencia
6. Otros datos relevantes: hábitos, antecedentes familiares si aplica

Reglas importantes:
- Habla en español con tono cálido, claro y sencillo. Sin tecnicismos.
- NO hagas diagnósticos ni sugieras tratamientos.
- Cuando hayas recopilado suficiente información (cubriste los temas principales), incluye "listo":true en tu respuesta.
- Si el paciente quiere terminar antes, respeta su decisión y también marca "listo":true.

DEBES responder SIEMPRE en formato JSON válido con esta estructura exacta:
{
  "respuesta": "Tu mensaje al paciente aquí",
  "resumen": "Resumen actualizado de TODA la información recopilada hasta ahora (texto libre, detallado)",
  "listo": false
}
`.trim();

async function enviarMensaje({ nombre, ciudad, nuevoMensaje, resumenPrevio, historialContexto }) {
  const partes = [];
  if (historialContexto) {
    partes.push(`Historial clínico previo del paciente (notas de la doctora):\n${historialContexto}`);
  }
  if (resumenPrevio) {
    partes.push(`Información recopilada en esta conversación:\n${resumenPrevio}`);
  }
  const contextoPrevio = partes.length > 0 ? partes.join('\n\n') + '\n\n' : '';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT(nombre, ciudad) },
    {
      role: 'user',
      content: `${contextoPrevio}Paciente dice: ${nuevoMensaje}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 600,
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    return { respuesta: raw, resumen: resumenPrevio || '', listo: false };
  }
}

async function generarNotaFinal(resumenFinal, nombre) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente médico. Formatea la siguiente información recopilada de un paciente como una nota clínica profesional y bien estructurada en español. Usa secciones claras.',
      },
      {
        role: 'user',
        content: `Paciente: ${nombre}\n\nInformación recopilada:\n${resumenFinal}`,
      },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  return response.choices[0].message.content.trim();
}

async function generarAudio(texto) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: texto,
    response_format: 'mp3',
  });
  return Buffer.from(await response.arrayBuffer());
}

module.exports = { enviarMensaje, generarNotaFinal, generarAudio };
