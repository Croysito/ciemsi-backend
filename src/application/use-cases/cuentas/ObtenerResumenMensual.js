class ObtenerResumenMensual {
  constructor(cuentaRepository, ciudadRepository) {
    this.cuentaRepo = cuentaRepository;
    this.ciudadRepo = ciudadRepository;
  }

  async execute(ciudadId, anio, mes) {
    const pad = (n) => String(n).padStart(2, '0');
    const primerDiaMes = `${anio}-${pad(mes)}-01`;
    const primerDiaMesSiguiente = mes === 12
      ? `${anio + 1}-01-01`
      : `${anio}-${pad(mes + 1)}-01`;

    const inicio = await this.cuentaRepo.calcularResumen(ciudadId, primerDiaMes);
    const fin = await this.cuentaRepo.calcularResumen(ciudadId, primerDiaMesSiguiente);

    return {
      ciudad: fin.ciudad,
      anio,
      mes,
      saldoInicialCaja: inicio.saldoCaja,
      saldoInicialBanco: inicio.saldoBanco,
      ingresosCajaMes: fin.ingresosCaja - inicio.ingresosCaja,
      ingresosBancoMes: fin.ingresosBanco - inicio.ingresosBanco,
      egresosCajaMes: fin.egresosCaja - inicio.egresosCaja,
      egresosBancoMes: fin.egresosBanco - inicio.egresosBanco,
      saldoFinalCaja: fin.saldoCaja,
      saldoFinalBanco: fin.saldoBanco,
    };
  }
}

module.exports = ObtenerResumenMensual;
