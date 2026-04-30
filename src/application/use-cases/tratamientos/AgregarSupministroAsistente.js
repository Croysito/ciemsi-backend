class AgregarSupministroAsistente {
  constructor(tratamientoRepository, suministroRepository) {
    this.tratamientoRepository = tratamientoRepository;
    this.suministroRepository = suministroRepository;
  }

  async execute({ tratamientoAsignadoId, suministroId, cantidad }) {
    // 1. Verificar que el tratamiento asignado existe
    const tratamientoAsignado = await this.tratamientoRepository.findAsignadoById(tratamientoAsignadoId);
    if (!tratamientoAsignado) throw new Error('Tratamiento asignado no encontrado');

    // 2. Verificar que el suministro sea INSUMO o MATERIAL
    const suministro = await this.suministroRepository.findById(suministroId);
    if (!suministro) throw new Error('Suministro no encontrado');
    if (suministro.tipo === 'MEDICAMENTO') {
      throw new Error('El asistente solo puede añadir insumos y materiales');
    }

    // 3. Verificar stock
    const inventario = await this.suministroRepository.getInventario(
      tratamientoAsignado.ciudad.id
    );
    const stock = inventario.find(i => i.id === suministroId);
    if (!stock || stock.saldo < cantidad) {
      throw new Error(`Stock insuficiente para ${suministro.nombreSuministro}`);
    }

    // 4. Agregar el suministro
    await this.tratamientoRepository.addSupministroAsignado({
      tratamientoAsignadoId,
      suministroId,
      cantidad,
      agregadoPor: 'ASISTENTE',
    });

    return { mensaje: 'Suministro agregado correctamente' };
  }
}

module.exports = AgregarSupministroAsistente;