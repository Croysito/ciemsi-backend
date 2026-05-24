class ConfirmarTraslado {
  constructor(trasladoRepository) {
    this.trasladoRepository = trasladoRepository;
  }

  async execute(id, usuarioConfirmador) {
    const traslado = await this.trasladoRepository.findById(id);
    if (!traslado) throw new Error('Traslado no encontrado');
    if (traslado.estado !== 'PENDIENTE') throw new Error('Solo se pueden confirmar traslados pendientes');

    const esAdminODoctora = ['Doctora', 'Admin'].includes(usuarioConfirmador.rol);
    const esAsistenteDestino =
      usuarioConfirmador.rol === 'Asistente' &&
      parseInt(usuarioConfirmador.ciudadId) === parseInt(traslado.ciudad_destino_id);

    if (!esAdminODoctora && !esAsistenteDestino) {
      throw new Error('No autorizado para confirmar este traslado');
    }

    await this.trasladoRepository.confirm(id, usuarioConfirmador.id);
    return { mensaje: 'Traslado confirmado correctamente' };
  }
}

module.exports = ConfirmarTraslado;
