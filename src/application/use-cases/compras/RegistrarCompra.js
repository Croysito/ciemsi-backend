class RegistrarCompra {
  constructor(compraRepository, suministroRepository) {
    this.compraRepository = compraRepository;
    this.suministroRepository = suministroRepository;
  }

  async execute({ fecha, ciudadId, usuarioId, items }) {
    if (!ciudadId || !usuarioId || !items || items.length === 0) {
      throw new Error('Ciudad, usuario e items son requeridos');
    }

    // 1. Crear la compra
    const compraId = await this.compraRepository.create({
      fecha: fecha || new Date(),
      ciudadId,
      usuarioId,
    });

    // 2. Registrar cada item
    for (const item of items) {
      const suministro = await this.suministroRepository.findById(item.suministroId);

      // Si no existe el suministro, crearlo en ese momento
      let suministroId = item.suministroId;
      if (!suministro && item.nuevoSuministro) {
        const resultado = await this.suministroRepository.create(item.nuevoSuministro);
        suministroId = resultado;
      } else if (!suministro) {
        throw new Error(`Suministro ${item.suministroId} no encontrado`);
      }

      const total = item.cantidad * item.precioUnitario;
      await this.compraRepository.addItem({
        compraId,
        suministroId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        total,
        fechaVencimiento: item.fechaVencimiento || null,
      });
    }

    const compra = await this.compraRepository.findById(compraId);
    return { mensaje: 'Compra registrada correctamente', compra };
  }
}

module.exports = RegistrarCompra;