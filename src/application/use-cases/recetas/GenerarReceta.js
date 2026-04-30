const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class GenerarReceta {
  constructor(recetaRepository, citaRepository) {
    this.recetaRepository = recetaRepository;
    this.citaRepository = citaRepository;
  }

  async execute({ citaId, detalle }) {
    // 1. Verificar que la cita existe y está confirmada
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) throw new Error('Cita no encontrada');
    if (!['CONFIRMADA', 'COMPLETADA'].includes(cita.estado)) {
      throw new Error('Solo se puede generar receta para citas confirmadas o completadas');
    }

    // 2. Verificar si ya existe una receta para esta cita
    const recetaExistente = await this.recetaRepository.findByCita(citaId);
    if (recetaExistente) throw new Error('Ya existe una receta para esta cita');

    // 3. Crear la receta en BD
    const recetaId = await this.recetaRepository.create({ citaId, detalle });

    // 4. Generar PDF
    const urlPdf = await this._generarPDF(recetaId, cita, detalle);

    // 5. Actualizar URL del PDF
    await this.recetaRepository.updateUrlPdf(recetaId, urlPdf);

    const receta = await this.recetaRepository.findByCita(citaId);
    return { mensaje: 'Receta generada correctamente', receta };
  }

  async _generarPDF(recetaId, cita, detalle) {
    const dir = path.join(__dirname, '../../../../public/recetas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `receta_${recetaId}.pdf`;
    const filepath = path.join(dir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).font('Helvetica-Bold').text('CIEMSI', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Centro Integral de Ecografía y Medicina', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Datos del paciente
      doc.fontSize(12).font('Helvetica-Bold').text('RECETA MÉDICA');
      doc.moveDown(0.5);
      doc.font('Helvetica')
        .text(`Paciente: ${cita.paciente.nombre} ${cita.paciente.apellido}`)
        .text(`Fecha: ${new Date(cita.fecha).toLocaleDateString('es-BO')}`)
        .text(`Ciudad: ${cita.ciudad?.nombreCiudad || ''}`);
      doc.moveDown();

      // Medicamentos
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Medicamentos recetados:');
      doc.moveDown(0.5);
      doc.font('Helvetica').text(detalle);
      doc.moveDown(2);

      // Firma
      doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
      doc.text('Firma del médico', { align: 'right' });

      doc.end();
      stream.on('finish', () => resolve(`/public/recetas/${filename}`));
      stream.on('error', reject);
    });
  }
}

module.exports = GenerarReceta;