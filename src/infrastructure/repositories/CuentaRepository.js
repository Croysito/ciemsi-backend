const ICuentaRepository = require('../../domain/repositories/ICuentaRepository');
const ResumenCuenta = require('../../domain/entities/ResumenCuenta');
const HistorialMovimiento = require('../../domain/entities/HistorialMovimiento');
const pool = require('../database/db');

class CuentaRepository extends ICuentaRepository {
  async calcularResumen(ciudadId, antesDe = null) {
    const params = [ciudadId];
    let corteIngresos = '';
    let corteCompras = '';
    let corteExtra = '';
    let corteTraslados = '';
    let corteTraspasos = '';
    if (antesDe) {
      params.push(antesDe);
      const n = params.length;
      corteIngresos  = ` AND fecha < $${n}`;
      corteCompras   = ` AND c.fecha::timestamp < $${n}`;
      corteExtra     = ` AND fecha < $${n}`;
      corteTraslados = ` AND fecha_confirmacion < $${n}`;
      corteTraspasos = ` AND fecha < $${n}`;
    }

    const { rows } = await pool.query(
      `SELECT
        -- Saldo inicial
        (SELECT COALESCE(monto, 0) FROM saldo_inicial WHERE ciudad_id = $1 AND tipo = 'caja')  AS ini_caja,
        (SELECT COALESCE(monto, 0) FROM saldo_inicial WHERE ciudad_id = $1 AND tipo = 'banco') AS ini_banco,

        -- Ingresos pacientes (cobros + ventas)
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE ciudad_id = $1 AND metodo = 'efectivo' ${corteIngresos}) AS ing_efec,
        (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE ciudad_id = $1 AND metodo = 'qr' ${corteIngresos})      AS ing_qr,

        -- Movimientos extra ingresos
        (SELECT COALESCE(SUM(monto), 0) FROM movimientos_extra WHERE ciudad_id = $1 AND tipo = 'ingreso' AND metodo = 'efectivo' ${corteExtra})      AS mex_ing_efec,
        (SELECT COALESCE(SUM(monto), 0) FROM movimientos_extra WHERE ciudad_id = $1 AND tipo = 'ingreso' AND metodo = 'transferencia' ${corteExtra}) AS mex_ing_trans,

        -- Compras (suma items suministros + items productos)
        (SELECT COALESCE(SUM(t.total), 0) FROM (
          SELECT cs.total FROM compra_suministro cs JOIN compras c ON c.id = cs.compra_id WHERE c.ciudad_id = $1 AND c.metodo = 'efectivo' ${corteCompras}
          UNION ALL
          SELECT cp.precio_unitario * cp.cantidad FROM compra_producto cp JOIN compras c ON c.id = cp.compra_id WHERE c.ciudad_id = $1 AND c.metodo = 'efectivo' ${corteCompras}
        ) t) AS comp_efec,
        (SELECT COALESCE(SUM(t.total), 0) FROM (
          SELECT cs.total FROM compra_suministro cs JOIN compras c ON c.id = cs.compra_id WHERE c.ciudad_id = $1 AND c.metodo = 'transferencia' ${corteCompras}
          UNION ALL
          SELECT cp.precio_unitario * cp.cantidad FROM compra_producto cp JOIN compras c ON c.id = cp.compra_id WHERE c.ciudad_id = $1 AND c.metodo = 'transferencia' ${corteCompras}
        ) t) AS comp_trans,

        -- Movimientos extra egresos
        (SELECT COALESCE(SUM(monto), 0) FROM movimientos_extra WHERE ciudad_id = $1 AND tipo = 'egreso' AND metodo = 'efectivo' ${corteExtra})      AS mex_egr_efec,
        (SELECT COALESCE(SUM(monto), 0) FROM movimientos_extra WHERE ciudad_id = $1 AND tipo = 'egreso' AND metodo = 'transferencia' ${corteExtra}) AS mex_egr_trans,

        -- Traslados recibidos (egreso en destino, asignado a caja)
        (SELECT COALESCE(SUM(costo_calculado), 0) FROM traslados WHERE ciudad_destino_id = $1 AND estado = 'COMPLETADO' AND costo_calculado IS NOT NULL ${corteTraslados}) AS traslados_egr,

        -- Traspasos entre caja y banco
        (SELECT COALESCE(SUM(monto), 0) FROM traspasos_cuenta WHERE ciudad_id = $1 AND tipo = 'efectivo_a_banco' ${corteTraspasos}) AS trp_efec_a_banco,
        (SELECT COALESCE(SUM(monto), 0) FROM traspasos_cuenta WHERE ciudad_id = $1 AND tipo = 'banco_a_efectivo' ${corteTraspasos}) AS trp_banco_a_efec`,
      params
    );

    const r = rows[0];
    const iniCaja  = parseFloat(r.ini_caja)   || 0;
    const iniBanco = parseFloat(r.ini_banco)  || 0;
    const ingEfec  = parseFloat(r.ing_efec)   || 0;
    const ingQr    = parseFloat(r.ing_qr)     || 0;
    const mexIngEfec  = parseFloat(r.mex_ing_efec)  || 0;
    const mexIngTrans = parseFloat(r.mex_ing_trans) || 0;
    const compEfec    = parseFloat(r.comp_efec)     || 0;
    const compTrans   = parseFloat(r.comp_trans)    || 0;
    const mexEgrEfec  = parseFloat(r.mex_egr_efec)  || 0;
    const mexEgrTrans = parseFloat(r.mex_egr_trans) || 0;
    const trasladosEgr  = parseFloat(r.traslados_egr)   || 0;
    const trpEfecABanco = parseFloat(r.trp_efec_a_banco) || 0;
    const trpBancoAEfec = parseFloat(r.trp_banco_a_efec) || 0;

    const ingresosCaja  = ingEfec + mexIngEfec + trpBancoAEfec;
    const ingresosBanco = ingQr   + mexIngTrans + trpEfecABanco;
    const egresosCaja   = compEfec  + mexEgrEfec  + trasladosEgr + trpEfecABanco;
    const egresosBanco  = compTrans + mexEgrTrans + trpBancoAEfec;

    // Fetch city info
    const { rows: ciudadRows } = await pool.query(
      'SELECT id, nombre_ciudad FROM ciudades WHERE id = $1', [ciudadId]
    );
    const ciudad = ciudadRows[0]
      ? { id: ciudadRows[0].id, nombreCiudad: ciudadRows[0].nombre_ciudad }
      : { id: ciudadId, nombreCiudad: '' };

    return new ResumenCuenta({
      ciudad,
      saldoInicialCaja:  iniCaja,
      saldoInicialBanco: iniBanco,
      ingresosCaja,
      ingresosBanco,
      egresosCaja,
      egresosBanco,
      saldoCaja:  iniCaja  + ingresosCaja  - egresosCaja,
      saldoBanco: iniBanco + ingresosBanco - egresosBanco,
    });
  }

  async obtenerHistorial({ ciudadId, fechaDesde, fechaHasta, tipo }) {
    const params = [ciudadId];
    const fechaCondIngresos = this._fechaCond('i.fecha',  fechaDesde, fechaHasta, params);
    const fechaCondCompras  = this._fechaCond('c.fecha::timestamp', fechaDesde, fechaHasta, params);
    const fechaCondExtra    = this._fechaCond('me.fecha', fechaDesde, fechaHasta, params);
    const fechaCondTraspaso = this._fechaCond('tr.fecha', fechaDesde, fechaHasta, params);
    const fechaCondTrasl    = this._fechaCond('t.fecha_confirmacion', fechaDesde, fechaHasta, params);

    const tipoFilter = tipo ? `AND tipo_mov = $${params.length + 1}` : '';
    if (tipo) params.push(tipo);

    const { rows } = await pool.query(
      `SELECT * FROM (
        SELECT
          i.id,
          'ingreso'::text AS tipo_mov,
          CASE i.tipo
            WHEN 'cobro_deuda'   THEN 'Cobro de deuda'
            WHEN 'adelanto_cita' THEN 'Adelanto de cita'
            ELSE 'Venta de producto'
          END AS categoria,
          i.notas  AS descripcion,
          i.monto::float,
          i.metodo,
          i.fecha,
          'ingreso_paciente'::text AS fuente,
          i.ciudad_id
        FROM ingresos i
        WHERE i.ciudad_id = $1 ${fechaCondIngresos}

        UNION ALL

        SELECT
          c.id,
          'egreso'::text AS tipo_mov,
          'Compra' AS categoria,
          NULL AS descripcion,
          (COALESCE((SELECT SUM(cs.total) FROM compra_suministro cs WHERE cs.compra_id = c.id), 0) +
           COALESCE((SELECT SUM(cp.precio_unitario * cp.cantidad) FROM compra_producto cp WHERE cp.compra_id = c.id), 0))::float AS monto,
          c.metodo,
          c.fecha::timestamp AS fecha,
          'compra'::text AS fuente,
          c.ciudad_id
        FROM compras c
        WHERE c.ciudad_id = $1 ${fechaCondCompras}

        UNION ALL

        SELECT
          me.id,
          me.tipo   AS tipo_mov,
          me.categoria,
          me.descripcion,
          me.monto::float,
          me.metodo,
          me.fecha,
          'movimiento_extra'::text AS fuente,
          me.ciudad_id
        FROM movimientos_extra me
        WHERE me.ciudad_id = $1 ${fechaCondExtra}

        UNION ALL

        SELECT
          tr.id,
          'traspaso'::text AS tipo_mov,
          'Traspaso' AS categoria,
          CASE tr.tipo
            WHEN 'efectivo_a_banco' THEN 'Efectivo → Banco'
            ELSE 'Banco → Efectivo'
          END AS descripcion,
          tr.monto::float,
          tr.tipo::text AS metodo,
          tr.fecha,
          'traspaso'::text AS fuente,
          tr.ciudad_id
        FROM traspasos_cuenta tr
        WHERE tr.ciudad_id = $1 ${fechaCondTraspaso}

        UNION ALL

        SELECT
          t.id,
          'egreso'::text AS tipo_mov,
          'Traslado recibido' AS categoria,
          'Desde ' || co.nombre_ciudad AS descripcion,
          t.costo_calculado::float AS monto,
          'efectivo'::text AS metodo,
          t.fecha_confirmacion AS fecha,
          'traslado'::text AS fuente,
          t.ciudad_destino_id AS ciudad_id
        FROM traslados t
        INNER JOIN ciudades co ON co.id = t.ciudad_origen_id
        WHERE t.ciudad_destino_id = $1
          AND t.estado = 'COMPLETADO'
          AND t.costo_calculado IS NOT NULL
          ${fechaCondTrasl}
      ) mov
      WHERE monto > 0 ${tipoFilter}
      ORDER BY fecha DESC`,
      params
    );

    return rows.map(r => new HistorialMovimiento({
      id: r.id,
      tipo: r.tipo_mov,
      categoria: r.categoria,
      descripcion: r.descripcion,
      monto: r.monto,
      metodo: r.metodo,
      fecha: r.fecha,
      fuente: r.fuente,
      ciudad: { id: r.ciudad_id },
    }));
  }

  _fechaCond(col, desde, hasta, params) {
    let cond = '';
    if (desde) {
      params.push(desde);
      cond += ` AND ${col} >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      cond += ` AND ${col} <= $${params.length}`;
    }
    return cond;
  }
}

module.exports = CuentaRepository;
