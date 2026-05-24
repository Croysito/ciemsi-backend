-- Reemplazar compra_productos / compra_producto_item por compra_producto → compras
-- La tabla `compras` ya maneja ciudad_id + fecha + usuario_id (igual que suministros)

DROP TABLE IF EXISTS compra_producto_item CASCADE;
DROP TABLE IF EXISTS compra_productos CASCADE;

CREATE TABLE IF NOT EXISTS compra_producto (
  id              SERIAL PRIMARY KEY,
  compra_id       INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad        NUMERIC(10,3) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL
);

-- Actualizar vista para usar compra_producto → compras
DROP VIEW IF EXISTS vista_inventario_productos;
CREATE VIEW vista_inventario_productos AS
WITH total_compras AS (
  SELECT cp.producto_id, c.ciudad_id, SUM(cp.cantidad) AS total
  FROM compra_producto cp
  INNER JOIN compras c ON c.id = cp.compra_id
  GROUP BY cp.producto_id, c.ciudad_id
),
total_ventas AS (
  SELECT ipi.producto_id, i.ciudad_id, SUM(ipi.cantidad) AS total
  FROM ingreso_producto_items ipi
  INNER JOIN ingresos i ON i.id = ipi.ingreso_id
  GROUP BY ipi.producto_id, i.ciudad_id
)
SELECT
  p.id,
  p.nombre,
  p.descripcion,
  p.unidad_medida,
  p.precio_venta,
  p.umbral,
  p.estado,
  ci.id AS ciudad_id,
  ci.nombre_ciudad,
  COALESCE(tc.total, 0)::bigint AS total_compras,
  COALESCE(tv.total, 0)::bigint AS total_ventas,
  (COALESCE(tc.total, 0) - COALESCE(tv.total, 0))::bigint AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) - COALESCE(tv.total, 0)) < p.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM productos p
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc ON tc.producto_id = p.id AND tc.ciudad_id = ci.id
LEFT JOIN total_ventas tv ON tv.producto_id = p.id AND tv.ciudad_id = ci.id
WHERE p.estado = true;
