const path = require('path');
const fs   = require('fs');

class SubirComprobanteCita {
  constructor(citaRepository) {
    this.citaRepository = citaRepository;
  }

  async execute(citaId, { buffer, originalName, mimeType }) {
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) throw new Error('Cita no encontrada');

    if (cita.estado !== 'PENDIENTE_PAGO') {
      throw new Error('Solo se puede subir comprobante para citas en espera de pago');
    }

    // Guardar archivo en uploads/comprobantes/
    const dir = path.join(process.cwd(), 'uploads', 'comprobantes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ext  = originalName.split('.').pop();
    const fileName = `cita_${citaId}_${Date.now()}.${ext}`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativePath = `/uploads/comprobantes/${fileName}`;
    await this.citaRepository.updateComprobante(citaId, relativePath);

    return { comprobantePath: relativePath };
  }
}

module.exports = SubirComprobanteCita;
