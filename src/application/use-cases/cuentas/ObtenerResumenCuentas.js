class ObtenerResumenCuentas {
  constructor(cuentaRepository, ciudadRepository) {
    this.cuentaRepo = cuentaRepository;
    this.ciudadRepo = ciudadRepository;
  }

  async execute(ciudadId) {
    if (ciudadId) {
      return [await this.cuentaRepo.calcularResumen(parseInt(ciudadId))];
    }
    // Sin filtro: calcular para todas las ciudades
    const ciudades = await this.ciudadRepo.findAll();
    return Promise.all(ciudades.map(c => this.cuentaRepo.calcularResumen(c.id)));
  }
}

module.exports = ObtenerResumenCuentas;
