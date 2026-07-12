class ResumenCuenta {
  constructor({
    ciudad,
    saldoInicialCaja, saldoInicialBanco,
    ingresosCaja, ingresosBanco,
    egresosCaja, egresosBanco,
    saldoCaja, saldoBanco,
  }) {
    this.ciudad = ciudad;
    this.saldoInicialCaja = saldoInicialCaja;
    this.saldoInicialBanco = saldoInicialBanco;
    this.ingresosCaja = ingresosCaja;
    this.ingresosBanco = ingresosBanco;
    this.egresosCaja = egresosCaja;
    this.egresosBanco = egresosBanco;
    this.saldoCaja = saldoCaja;
    this.saldoBanco = saldoBanco;
  }
}

module.exports = ResumenCuenta;
