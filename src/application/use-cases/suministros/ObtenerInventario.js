class ObtenerInventario {
  constructor(suministroRepository) {
    this.suministroRepository = suministroRepository;
  }

  async execute(ciudadId) {
    if (!ciudadId) throw new Error('Ciudad es requerida');
    const inventario = await this.suministroRepository.getInventario(ciudadId);
    const stockBajo = inventario.filter(i => i.stock_bajo);
    return { inventario, stockBajo, totalItems: inventario.length };
  }
}

module.exports = ObtenerInventario;