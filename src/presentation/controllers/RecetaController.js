const GenerarReceta = require('../../application/use-cases/recetas/GenerarReceta');
const RecetaRepository = require('../../infrastructure/repositories/RecetaRepository');
const CitaRepository = require('../../infrastructure/repositories/CitaRepository');
const path = require('path');

const recetaRepository = new RecetaRepository();
const citaRepository = new CitaRepository();

class RecetaController {
  async generar(req, res) {
    try {
      const { citaId, detalle } = req.body;
      if (!citaId || !detalle) {
        return res.status(400).json({
          mensaje: 'Cita y detalle son requeridos'
        });
      }
      const useCase = new GenerarReceta(recetaRepository, citaRepository);
      const resultado = await useCase.execute({ citaId, detalle });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
  }

  async obtenerByCita(req, res) {
    try {
      const { citaId } = req.params;
      const receta = await recetaRepository.findByCita(parseInt(citaId));
      if (!receta) {
        return res.status(404).json({ mensaje: 'No hay receta para esta cita' });
      }
      return res.status(200).json(receta);
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }

  async obtenerWhatsappLink(req, res) {
    try {
      const { citaId } = req.params;
      const receta = await recetaRepository.findByCita(parseInt(citaId));
      if (!receta) {
        return res.status(404).json({ mensaje: 'No hay receta para esta cita' });
      }
      if (!receta.urlPdf) {
        return res.status(400).json({ mensaje: 'La receta no tiene PDF generado' });
      }

      const telefono = receta.cita.paciente.telefono;
      if (!telefono) {
        return res.status(400).json({ mensaje: 'El paciente no tiene teléfono registrado' });
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const pdfUrl = `${baseUrl}${receta.urlPdf}`;
      const mensaje = encodeURIComponent(
        `Estimado/a ${receta.cita.paciente.nombre}, adjunto su receta médica de CIEMSI: ${pdfUrl}`
      );
      const whatsappLink = `https://wa.me/591${telefono}?text=${mensaje}`;

      return res.status(200).json({ whatsappLink, pdfUrl });
    } catch (error) {
      return res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = new RecetaController();