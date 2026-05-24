class DevolverTraslado {
  constructor(trasladoRepository) {
    this.trasladoRepository = trasladoRepository;
  }

  async execute(id) {
    const traslado = await this.trasladoRepository.findById(id);
    if (!traslado) throw new Error('Traslado no encontrado');
    if (traslado.estado !== 'COMPLETADO') throw new Error('Solo se pueden devolver traslados completados');

    await this.trasladoRepository.devolver(id);
    return { mensaje: 'Traslado devuelto correctamente' };
  }
}

module.exports = DevolverTraslado;
