-- Fix vista_inventario: rewrite using CTEs to avoid Cartesian product bug.
-- The old view used SUM(DISTINCT cantidad) which deduplicates by value, not by row ID,
-- causing incorrect totals when multiple records share the same quantity value.

CREATE OR REPLACE VIEW vista_inventario AS
WITH total_compras AS (
  SELECT
    cs.suministro_id,
    c.ciudad_id,
    SUM(cs.cantidad) AS total
  FROM compra_suministro cs
  INNER JOIN compras c ON c.id = cs.compra_id
  GROUP BY cs.suministro_id, c.ciudad_id
),
total_salidas AS (
  SELECT
    asu.suministro_id,
    cm.ciudad_id,
    SUM(asu.cantidad) AS total
  FROM asignado_suministro asu
  INNER JOIN tratamiento_asignado ta ON ta.id = asu.tratamiento_asignado_id
  INNER JOIN citas_medicas cm ON cm.id = ta.cita_id
  WHERE ta.estado = 'COMPLETADO'
  GROUP BY asu.suministro_id, cm.ciudad_id
)
SELECT
  s.id,
  s.nombre_suministro,
  s.unidad_medida,
  s.marca,
  s.tipo,
  s.umbral,
  ci.id AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0) AS total_compras,
  COALESCE(ts.total, 0) AS total_salidas,
  COALESCE(tc.total, 0) - COALESCE(ts.total, 0) AS saldo,
  CASE
    WHEN COALESCE(tc.total, 0) - COALESCE(ts.total, 0) < s.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM suministros s
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc ON tc.suministro_id = s.id AND tc.ciudad_id = ci.id
LEFT JOIN total_salidas ts ON ts.suministro_id = s.id AND ts.ciudad_id = ci.id
WHERE s.estado = true;
