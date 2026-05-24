class CrearTraslado {
  constructor(trasladoRepository) {
    this.trasladoRepository = trasladoRepository;
  }

  async execute({ tipo, suministroId, productoId, ciudadOrigenId, ciudadDestinoId, cantidad, usuarioId }) {
    if (!tipo || !ciudadOrigenId || !ciudadDestinoId || !cantidad) {
      throw new Error('Faltan campos requeridos');
    }
    if (ciudadOrigenId === ciudadDestinoId) {
      throw new Error('La ciudad de origen y destino deben ser diferentes');
    }
    if (tipo === 'SUMINISTRO' && !suministroId) throw new Error('Suministro requerido');
    if (tipo === 'PRODUCTO' && !productoId) throw new Error('Producto requerido');

    const disponible = await this.trasladoRepository.getStockDisponible({
      tipo, suministroId, productoId, ciudadOrigenId,
    });
    if (disponible !== null && cantidad > disponible) {
      throw new Error(`Stock insuficiente en la sucursal de origen. Disponible: ${disponible}`);
    }

    const id = await this.trasladoRepository.create({
      tipo, suministroId, productoId, ciudadOrigenId, ciudadDestinoId, cantidad, usuarioId,
    });
    return { id, mensaje: 'Traslado creado correctamente' };
  }
}

module.exports = CrearTraslado;
