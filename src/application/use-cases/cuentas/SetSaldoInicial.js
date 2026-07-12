class SetSaldoInicial {
  constructor(saldoInicialRepository) {
    this.repo = saldoInicialRepository;
  }

  async execute({ ciudadId, tipo, monto, updatedBy }) {
    if (!['caja', 'banco'].includes(tipo)) {
      throw new Error('tipo debe ser caja o banco');
    }
    if (monto === undefined || monto === null || Number(monto) < 0) {
      throw new Error('El monto debe ser mayor o igual a 0');
    }
    return this.repo.upsert({ ciudadId, tipo, monto: Number(monto), updatedBy });
  }
}

module.exports = SetSaldoInicial;
