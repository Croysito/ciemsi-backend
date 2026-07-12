class ISaldoInicialRepository {
  async upsert({ ciudadId, tipo, monto, updatedBy }) { throw new Error('No implementado'); }
  async findByCiudad(ciudadId)                        { throw new Error('No implementado'); }
  async findAll()                                     { throw new Error('No implementado'); }
}

module.exports = ISaldoInicialRepository;
