class IIngresoRepository {
  async createCobroDeuda(ingreso) { throw new Error('Método createCobroDeuda() no implementado'); }
  async createVentaProducto(ingreso) { throw new Error('Método createVentaProducto() no implementado'); }
  async addProductoItem(item) { throw new Error('Método addProductoItem() no implementado'); }
  async findById(id) { throw new Error('Método findById() no implementado'); }
  async findByPaciente(pacienteId) { throw new Error('Método findByPaciente() no implementado'); }
}

module.exports = IIngresoRepository;
