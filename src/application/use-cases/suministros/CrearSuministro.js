class CrearSuministro {
  constructor(suministroRepository) {
    this.suministroRepository = suministroRepository;
  }

  async execute({ nombreSuministro, unidadMedida, marca, tipo, umbral }) {
    if (!nombreSuministro || !unidadMedida || !tipo) {
      throw new Error('Nombre, unidad de medida y tipo son requeridos');
    }
    const tiposValidos = ['MEDICAMENTO', 'INSUMO', 'MATERIAL'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo no válido. Use: MEDICAMENTO, INSUMO o MATERIAL');
    }
    const id = await this.suministroRepository.create({
      nombreSuministro, unidadMedida, marca, tipo, umbral,
    });
    return { mensaje: 'Suministro creado correctamente', id };
  }
}

module.exports = CrearSuministro;