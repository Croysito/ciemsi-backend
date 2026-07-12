class IMovimientoExtraRepository {
  async create(data)                    { throw new Error('No implementado'); }
  async findByCiudad({ ciudadId, tipo, fechaDesde, fechaHasta }) { throw new Error('No implementado'); }
  async deleteById(id)                  { throw new Error('No implementado'); }
}

module.exports = IMovimientoExtraRepository;
