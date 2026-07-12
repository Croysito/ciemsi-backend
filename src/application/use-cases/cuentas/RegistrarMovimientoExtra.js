const CATEGORIAS_VALIDAS = [
  'alquiler', 'pago_empleados', 'expensas', 'luz', 'internet',
  'refrigerio', 'equipos', 'otro',
];

class RegistrarMovimientoExtra {
  constructor(movimientoExtraRepository) {
    this.repo = movimientoExtraRepository;
  }

  async execute({ tipo, categoria, descripcion, monto, metodo, ciudadId, usuarioId }) {
    if (!['ingreso', 'egreso'].includes(tipo)) {
      throw new Error('Tipo inválido: debe ser ingreso o egreso');
    }
    if (!['efectivo', 'transferencia'].includes(metodo)) {
      throw new Error('Método inválido: debe ser efectivo o transferencia');
    }
    if (!monto || Number(monto) <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    const catNorm = categoria?.toLowerCase().trim();
    if (!catNorm) throw new Error('La categoría es requerida');
    const catFinal = CATEGORIAS_VALIDAS.includes(catNorm) ? catNorm : 'otro';
    const descFinal = catFinal === 'otro' ? (descripcion || categoria) : descripcion;

    return this.repo.create({
      tipo,
      categoria: catFinal,
      descripcion: descFinal || null,
      monto: Number(monto),
      metodo,
      ciudadId,
      usuarioId,
    });
  }
}

module.exports = RegistrarMovimientoExtra;
