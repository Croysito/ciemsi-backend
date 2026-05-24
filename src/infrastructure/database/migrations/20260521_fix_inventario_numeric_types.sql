-- Fix: SUM() y NUMERIC en PostgreSQL se devuelven como strings por node-postgres.
-- Castear explícitamente a INTEGER (INT4) que pg sí retorna como número JS.

-- ── vista_inventario (suministros) ──────────────────────────────────────────
CREATE OR REPLACE VIEW vista_inventario AS
WITH total_compras AS (
  SELECT
    cs.suministro_id,
    c.ciudad_id,
    SUM(cs.cantidad)::int AS total
  FROM compra_suministro cs
  INNER JOIN compras c ON c.id = cs.compra_id
  GROUP BY cs.suministro_id, c.ciudad_id
),
total_salidas AS (
  SELECT
    asu.suministro_id,
    cm.ciudad_id,
    SUM(asu.cantidad)::int AS total
  FROM asignado_suministro asu
  INNER JOIN tratamiento_asignado ta ON ta.id = asu.tratamiento_asignado_id
  INNER JOIN citas_medicas cm ON cm.id = ta.cita_id
  WHERE ta.estado = 'COMPLETADO'
  GROUP BY asu.suministro_id, cm.ciudad_id
)
SELECT
  s.id::int,
  s.nombre_suministro,
  s.unidad_medida,
  s.marca,
  s.tipo,
  s.umbral::int,
  ci.id::int AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0)::int AS total_compras,
  COALESCE(ts.total, 0)::int AS total_salidas,
  (COALESCE(tc.total, 0) - COALESCE(ts.total, 0))::int AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) - COALESCE(ts.total, 0)) < s.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM suministros s
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc ON tc.suministro_id = s.id AND tc.ciudad_id = ci.id
LEFT JOIN total_salidas ts ON ts.suministro_id = s.id AND ts.ciudad_id = ci.id
WHERE s.estado = true;

-- ── vista_inventario_productos ───────────────────────────────────────────────
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
)
SELECT
  p.id::int,
  p.nombre,
  p.descripcion,
  p.unidad_medida,
  p.precio_venta,
  p.umbral::int,
  p.estado,
  ci.id::int AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0)::int AS total_compras,
  COALESCE(tv.total, 0)::int AS total_ventas,
  (COALESCE(tc.total, 0) - COALESCE(tv.total, 0))::int AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) - COALESCE(tv.total, 0)) < p.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM productos p
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc ON tc.producto_id = p.id AND tc.ciudad_id = ci.id
LEFT JOIN total_ventas tv ON tv.producto_id = p.id AND tv.ciudad_id = ci.id
WHERE p.estado = true;
