-- Módulo de traslados entre sucursales

CREATE TABLE IF NOT EXISTS traslados (
  id                      SERIAL PRIMARY KEY,
  tipo                    VARCHAR(15)    NOT NULL CHECK (tipo IN ('SUMINISTRO', 'PRODUCTO')),
  suministro_id           INTEGER        REFERENCES suministros(id),
  producto_id             INTEGER        REFERENCES productos(id),
  ciudad_origen_id        INTEGER        NOT NULL REFERENCES ciudades(id),
  ciudad_destino_id       INTEGER        NOT NULL REFERENCES ciudades(id),
  cantidad                NUMERIC(10,3)  NOT NULL CHECK (cantidad > 0),
  estado                  VARCHAR(15)    NOT NULL DEFAULT 'PENDIENTE'
                                         CHECK (estado IN ('PENDIENTE', 'COMPLETADO', 'DEVUELTO')),
  usuario_id              INTEGER        NOT NULL REFERENCES usuarios(id),
  usuario_confirmacion_id INTEGER        REFERENCES usuarios(id),
  fecha                   TIMESTAMP      NOT NULL DEFAULT NOW(),
  fecha_confirmacion      TIMESTAMP,
  fecha_devolucion        TIMESTAMP,
  CONSTRAINT traslado_item_check CHECK (
    (tipo = 'SUMINISTRO' AND suministro_id IS NOT NULL AND producto_id IS NULL) OR
    (tipo = 'PRODUCTO'   AND producto_id   IS NOT NULL AND suministro_id IS NULL)
  ),
  CONSTRAINT traslado_ciudades_distintas CHECK (ciudad_origen_id <> ciudad_destino_id)
);

-- ── vista_inventario: incluye traslados COMPLETADO ───────────────────────────
CREATE OR REPLACE VIEW vista_inventario AS
WITH total_compras AS (
  SELECT cs.suministro_id, c.ciudad_id, SUM(cs.cantidad)::int AS total
  FROM compra_suministro cs
  INNER JOIN compras c ON c.id = cs.compra_id
  GROUP BY cs.suministro_id, c.ciudad_id
),
total_salidas AS (
  SELECT asu.suministro_id, cm.ciudad_id, SUM(asu.cantidad)::int AS total
  FROM asignado_suministro asu
  INNER JOIN tratamiento_asignado ta ON ta.id = asu.tratamiento_asignado_id
  INNER JOIN citas_medicas cm ON cm.id = ta.cita_id
  WHERE ta.estado = 'COMPLETADO'
  GROUP BY asu.suministro_id, cm.ciudad_id
),
traslados_entrada AS (
  SELECT t.suministro_id, t.ciudad_destino_id AS ciudad_id,
         SUM(t.cantidad)::int AS total
  FROM traslados t
  WHERE t.tipo = 'SUMINISTRO' AND t.estado = 'COMPLETADO'
  GROUP BY t.suministro_id, t.ciudad_destino_id
),
traslados_salida AS (
  SELECT t.suministro_id, t.ciudad_origen_id AS ciudad_id,
         SUM(t.cantidad)::int AS total
  FROM traslados t
  WHERE t.tipo = 'SUMINISTRO' AND t.estado = 'COMPLETADO'
  GROUP BY t.suministro_id, t.ciudad_origen_id
)
SELECT
  s.id::int,
  s.nombre_suministro,
  s.unidad_medida,
  s.marca,
  s.tipo,
  s.umbral::int,
  ci.id::int            AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0)::int   AS total_compras,
  COALESCE(ts.total, 0)::int   AS total_salidas,
  (COALESCE(tc.total, 0) + COALESCE(te.total, 0)
   - COALESCE(tsal.total, 0)   - COALESCE(ts.total, 0))::int AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) + COALESCE(te.total, 0)
          - COALESCE(tsal.total, 0) - COALESCE(ts.total, 0)) < s.umbral
    THEN true ELSE false
  END AS stock_bajo
FROM suministros s
CROSS JOIN ciudades ci
LEFT JOIN total_compras    tc   ON tc.suministro_id  = s.id AND tc.ciudad_id   = ci.id
LEFT JOIN total_salidas    ts   ON ts.suministro_id  = s.id AND ts.ciudad_id   = ci.id
LEFT JOIN traslados_entrada te  ON te.suministro_id  = s.id AND te.ciudad_id   = ci.id
LEFT JOIN traslados_salida  tsal ON tsal.suministro_id = s.id AND tsal.ciudad_id = ci.id
WHERE s.estado = true;

-- ── vista_inventario_productos: incluye traslados COMPLETADO ─────────────────
CREATE OR REPLACE VIEW vista_inventario_productos AS
WITH total_compras AS (
  SELECT cp.producto_id, c.ciudad_id, SUM(cp.cantidad)::int AS total
  FROM compra_producto cp
  INNER JOIN compras c ON c.id = cp.compra_id
  GROUP BY cp.producto_id, c.ciudad_id
),
total_ventas AS (
  SELECT ipi.producto_id, i.ciudad_id, SUM(ipi.cantidad)::int AS total
  FROM ingreso_producto_items ipi
  INNER JOIN ingresos i ON i.id = ipi.ingreso_id
  GROUP BY ipi.producto_id, i.ciudad_id
),
traslados_entrada AS (
  SELECT t.producto_id, t.ciudad_destino_id AS ciudad_id,
         SUM(t.cantidad)::int AS total
  FROM traslados t
  WHERE t.tipo = 'PRODUCTO' AND t.estado = 'COMPLETADO'
  GROUP BY t.producto_id, t.ciudad_destino_id
),
traslados_salida AS (
  SELECT t.producto_id, t.ciudad_origen_id AS ciudad_id,
         SUM(t.cantidad)::int AS total
  FROM traslados t
  WHERE t.tipo = 'PRODUCTO' AND t.estado = 'COMPLETADO'
  GROUP BY t.producto_id, t.ciudad_origen_id
)
SELECT
  p.id::int,
  p.nombre,
  p.descripcion,
  p.unidad_medida,
  p.precio_venta,
  p.umbral::int,
  p.estado,
  ci.id::int            AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0)::int   AS total_compras,
  COALESCE(tv.total, 0)::int   AS total_ventas,
  (COALESCE(tc.total, 0) + COALESCE(te.total, 0)
   - COALESCE(tsal.total, 0)   - COALESCE(tv.total, 0))::int AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) + COALESCE(te.total, 0)
          - COALESCE(tsal.total, 0) - COALESCE(tv.total, 0)) < p.umbral
    THEN true ELSE false
  END AS stock_bajo
FROM productos p
CROSS JOIN ciudades ci
LEFT JOIN total_compras    tc   ON tc.producto_id  = p.id AND tc.ciudad_id   = ci.id
LEFT JOIN total_ventas     tv   ON tv.producto_id  = p.id AND tv.ciudad_id   = ci.id
LEFT JOIN traslados_entrada te  ON te.producto_id  = p.id AND te.ciudad_id   = ci.id
LEFT JOIN traslados_salida  tsal ON tsal.producto_id = p.id AND tsal.ciudad_id = ci.id
WHERE p.estado = true;
