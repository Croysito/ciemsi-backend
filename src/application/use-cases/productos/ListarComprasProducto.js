class ListarComprasProducto {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(ciudadId) {
    return this.productoRepository.findAllCompras(ciudadId);
  }
}

module.exports = ListarComprasProducto;
