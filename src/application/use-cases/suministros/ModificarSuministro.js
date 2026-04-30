class ModificarSuministro {
  constructor(suministroRepository) {
    this.suministroRepository = suministroRepository;
  }

  async execute(id, { nombreSuministro, unidadMedida, marca, tipo, umbral, estado }) {
    const suministro = await this.suministroRepository.findById(id);
    if (!suministro) throw new Error('Suministro no encontrado');
    await this.suministroRepository.update(id, {
      nombreSuministro: nombreSuministro || suministro.nombreSuministro,
      unidadMedida: unidadMedida || suministro.unidadMedida,
      marca: marca || suministro.marca,
      tipo: tipo || suministro.tipo,
      umbral: umbral !== undefined ? umbral : suministro.umbral,
      estado: estado !== undefined ? estado : suministro.estado,
    });
    return { mensaje: 'Suministro actualizado correctamente' };
  }
}

module.exports = ModificarSuministro;