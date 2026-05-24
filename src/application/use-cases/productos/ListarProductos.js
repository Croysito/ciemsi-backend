class ListarProductos {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute() {
    return this.productoRepository.findAll();
  }
}

module.exports = ListarProductos;
