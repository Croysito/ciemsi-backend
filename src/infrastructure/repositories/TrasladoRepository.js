const pool = require('../database/db');

class TrasladoRepository {
  async getStockDisponible({ tipo, suministroId, productoId, ciudadOrigenId }) {
    if (tipo === 'SUMINISTRO') {
      const { rows } = await pool.query(
        `SELECT
           vi.saldo - COALESCE((
             SELECT SUM(t.cantidad) FROM traslados t
             WHERE t.tipo = 'SUMINISTRO'
               AND t.suministro_id    = $1
               AND t.ciudad_origen_id = $2
               AND t.estado = 'PENDIENTE'
           ), 0) AS disponible
         FROM vista_inventario vi
         WHERE vi.id = $1 AND vi.ciudad_id = $2`,
        [suministroId, ciudadOrigenId]
      );
      return rows[0] != null ? parseFloat(rows[0].disponible) : null;
    } else {
      const { rows } = await pool.query(
        `SELECT
           vip.saldo - COALESCE((
             SELECT SUM(t.cantidad) FROM traslados t
             WHERE t.tipo = 'PRODUCTO'
               AND t.producto_id      = $1
               AND t.ciudad_origen_id = $2
               AND t.estado = 'PENDIENTE'
           ), 0) AS disponible
         FROM vista_inventario_productos vip
         WHERE vip.id = $1 AND vip.ciudad_id = $2`,
        [productoId, ciudadOrigenId]
      );
      return rows[0] != null ? parseFloat(rows[0].disponible) : null;
    }
  }

  async create({ tipo, suministroId, productoId, ciudadOrigenId, ciudadDestinoId, cantidad, usuarioId }) {
    const { rows } = await pool.query(
      `INSERT INTO traslados
         (tipo, suministro_id, producto_id, ciudad_origen_id, ciudad_destino_id, cantidad, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [tipo, suministroId || null, productoId || null, ciudadOrigenId, ciudadDestinoId, cantidad, usuarioId]
    );
    return rows[0].id;
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM traslados WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findByCiudad(ciudadId) {
    const { rows } = await pool.query(`
      SELECT
        t.id::int,
        t.tipo,
        t.suministro_id::int,
        s.nombre_suministro,
        t.producto_id::int,
        p.nombre            AS nombre_producto,
        t.ciudad_origen_id::int,
        co.nombre_ciudad    AS nombre_ciudad_origen,
        t.ciudad_destino_id::int,
        cd.nombre_ciudad    AS nombre_ciudad_destino,
        t.cantidad::float,
        t.estado,
        t.usuario_id::int,
        u.nombre || ' ' || u.apellido AS nombre_usuario,
        t.fecha,
        t.fecha_confirmacion,
        t.fecha_devolucion
      FROM traslados t
      LEFT JOIN suministros s ON s.id = t.suministro_id
      LEFT JOIN productos   p ON p.id = t.producto_id
      INNER JOIN ciudades  co ON co.id = t.ciudad_origen_id
      INNER JOIN ciudades  cd ON cd.id = t.ciudad_destino_id
      INNER JOIN usuarios   u ON u.id  = t.usuario_id
      WHERE t.ciudad_origen_id = $1 OR t.ciudad_destino_id = $1
      ORDER BY t.fecha DESC
    `, [ciudadId]);
    return rows;
  }

  async confirm(id, usuarioConfirmacionId) {
    // Obtener datos del traslado para calcular costo promedio
    const { rows: traslRows } = await pool.query(
      'SELECT tipo, suministro_id, producto_id, ciudad_origen_id, cantidad FROM traslados WHERE id = $1',
      [id]
    );
    const t = traslRows[0];
    let costoCalculado = null;
    if (t) {
      const precioPromedio = await this._calcularPrecioPromedio(t);
      if (precioPromedio > 0) {
        costoCalculado = parseFloat((precioPromedio * parseFloat(t.cantidad)).toFixed(2));
      }
    }

    const { rows } = await pool.query(
      `UPDATE traslados
       SET estado = 'COMPLETADO',
           usuario_confirmacion_id = $1,
           fecha_confirmacion = NOW(),
           costo_calculado = $3
       WHERE id = $2 RETURNING id`,
      [usuarioConfirmacionId, id, costoCalculado]
    );
    return rows[0];
  }

  async _calcularPrecioPromedio({ tipo, suministro_id, producto_id, ciudad_origen_id }) {
    if (tipo === 'SUMINISTRO') {
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(cs.total) / NULLIF(SUM(cs.cantidad), 0), 0) AS promedio
         FROM compra_suministro cs
         JOIN compras c ON c.id = cs.compra_id
         WHERE cs.suministro_id = $1 AND c.ciudad_id = $2`,
        [suministro_id, ciudad_origen_id]
      );
      return parseFloat(rows[0]?.promedio || 0);
    } else {
      const { rows } = await pool.query(
        `SELECT COALESCE(
           SUM(cp.precio_unitario * cp.cantidad) / NULLIF(SUM(cp.cantidad), 0), 0
         ) AS promedio
         FROM compra_producto cp
         JOIN compras c ON c.id = cp.compra_id
         WHERE cp.producto_id = $1 AND c.ciudad_id = $2`,
        [producto_id, ciudad_origen_id]
      );
      return parseFloat(rows[0]?.promedio || 0);
    }
  }

  async devolver(id) {
    const { rows } = await pool.query(
      `UPDATE traslados SET estado = 'DEVUELTO', fecha_devolucion = NOW()
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
}

module.exports = TrasladoRepository;
