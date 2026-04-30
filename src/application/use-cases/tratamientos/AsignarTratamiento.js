class AsignarTratamiento {
  constructor(tratamientoRepository, citaRepository, suministroRepository, notificacionService) {
    this.tratamientoRepository = tratamientoRepository;
    this.citaRepository = citaRepository;
    this.suministroRepository = suministroRepository;
    this.notificacionService = notificacionService;
  }

  async execute({ tratamientoId, citaId, precio, medicamentos }) {
    // 1. Verificar que la cita existe y está confirmada
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) throw new Error('Cita no encontrada');
    if (cita.estado !== 'CONFIRMADA') {
      throw new Error('Solo se puede asignar tratamiento a citas confirmadas');
    }

    // 2. Verificar que el tratamiento existe
    const tratamiento = await this.tratamientoRepository.findById(tratamientoId);
    if (!tratamiento) throw new Error('Tratamiento no encontrado');

    // 3. Verificar stock de medicamentos
    if (medicamentos && medicamentos.length > 0) {
      for (const med of medicamentos) {
        const inventario = await this.suministroRepository.getInventario(cita.ciudad.id);
        const stock = inventario.find(i => i.id === med.suministroId);
        if (!stock || stock.saldo < med.cantidad) {
          throw new Error(`Stock insuficiente para el suministro ${stock?.nombre_suministro || med.suministroId}`);
        }
        // Verificar que sea MEDICAMENTO
        const suministro = await this.suministroRepository.findById(med.suministroId);
        if (suministro.tipo !== 'MEDICAMENTO') {
          throw new Error(`Solo se pueden añadir medicamentos en este paso`);
        }
      }
    }

    // 4. Crear el tratamiento asignado
    const tratamientoAsignadoId = await this.tratamientoRepository.asignar({
      tratamientoId,
      citaId,
      precio: precio || tratamiento.precioBase,
    });

    // 5. Agregar medicamentos seleccionados por la Doctora
    if (medicamentos && medicamentos.length > 0) {
      for (const med of medicamentos) {
        await this.tratamientoRepository.addSupministroAsignado({
          tratamientoAsignadoId,
          suministroId: med.suministroId,
          cantidad: med.cantidad,
          agregadoPor: 'DOCTORA',
        });
      }
    }

    // 6. Notificar al asistente
    const tratamientoAsignado = await this.tratamientoRepository.findAsignadoById(tratamientoAsignadoId);
    if (this.notificacionService) {
      await this.notificacionService.tratamientoAsignado(tratamientoAsignado);
    }

    return { mensaje: 'Tratamiento asignado correctamente', tratamientoAsignadoId };
  }
}

module.exports = AsignarTratamiento;