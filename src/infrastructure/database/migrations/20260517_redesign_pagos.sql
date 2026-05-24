-- Épica 6 rediseño: Pagos y Deudas
-- Flujo correcto:
-- 1. Cita COMPLETADA → deuda auto-creada desde tratamiento_asignado.precio
-- 2. Ingreso tipo 'cobro_deuda': paga una deuda (parcial o total)
-- 3. Ingreso tipo 'venta_producto': venta de productos del inventario de productos

-- ─── Limpiar tablas anteriores ───────────────────────────────────────────────
DROP TABLE IF EXISTS cobros CASCADE;
DROP TABLE IF EXISTS ingreso_items CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;
DROP TABLE IF EXISTS deudas CASCADE;

-- ─── Restaurar vista_inventario sin ventas de productos ───────────────────────
DROP VIEW IF EXISTS vista_inventario;
CREATE VIEW vista_inventario AS
WITH total_compras AS (
  SELECT cs.suministro_id, c.ciudad_id, SUM(cs.cantidad) AS total
  FROM compra_suministro cs
  INNER JOIN compras c ON c.id = cs.compra_id
  GROUP BY cs.suministro_id, c.ciudad_id
),
total_salidas AS (
  SELECT asu.suministro_id, cm.ciudad_id, SUM(asu.cantidad) AS total
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
  COALESCE(tc.total, 0)::bigint AS total_compras,
  COALESCE(ts.total, 0)::bigint AS total_salidas,
  (COALESCE(tc.total, 0) - COALESCE(ts.total, 0))::bigint AS saldo,
  CASE
    WHEN (COALESCE(tc.total, 0) - COALESCE(ts.total, 0)) < s.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM suministros s
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc ON tc.suministro_id = s.id AND tc.ciudad_id = ci.id
LEFT JOIN total_salidas ts ON ts.suministro_id = s.id AND ts.ciudad_id = ci.id
WHERE s.estado = true;

-- ─── Productos vendibles (independientes de suministros/medicamentos) ────────
CREATE TABLE IF NOT EXISTS productos (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  unidad_medida VARCHAR(30) NOT NULL DEFAULT 'unidad',
  precio_venta  NUMERIC(10,2) NOT NULL DEFAULT 0,
  umbral        INTEGER NOT NULL DEFAULT 0,
  estado        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Compras de productos (stock-in por ciudad) ───────────────────────────────
CREATE TABLE IF NOT EXISTS compra_productos (
  id          SERIAL PRIMARY KEY,
  ciudad_id   INTEGER NOT NULL REFERENCES ciudades(id),
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor   VARCHAR(100),
  notas       TEXT,
  created_by  INTEGER NOT NULL REFERENCES usuarios(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compra_producto_item (
  id              SERIAL PRIMARY KEY,
  compra_id       INTEGER NOT NULL REFERENCES compra_productos(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad        NUMERIC(10,3) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL
);

-- ─── Deudas (auto-creadas cuando cita es COMPLETADA) ─────────────────────────
CREATE TABLE IF NOT EXISTS deudas (
  id                      SERIAL PRIMARY KEY,
  paciente_id             INTEGER NOT NULL REFERENCES pacientes(id),
  tratamiento_asignado_id INTEGER NOT NULL REFERENCES tratamiento_asignado(id),
  monto_original          NUMERIC(10,2) NOT NULL,
  monto_pendiente         NUMERIC(10,2) NOT NULL,
  estado                  VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente', 'pagada')),
  fecha_limite            DATE,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Ingresos (cobros recibidos: por deuda o por venta de producto) ───────────
CREATE TABLE IF NOT EXISTS ingresos (
  id          SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  ciudad_id   INTEGER NOT NULL REFERENCES ciudades(id),
  tipo        VARCHAR(20) NOT NULL
                CHECK (tipo IN ('cobro_deuda', 'venta_producto')),
  deuda_id    INTEGER REFERENCES deudas(id),   -- solo para cobro_deuda
  monto       NUMERIC(10,2) NOT NULL,
  metodo      VARCHAR(20) NOT NULL CHECK (metodo IN ('efectivo', 'qr')),
  notas       TEXT,
  fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by  INTEGER NOT NULL REFERENCES usuarios(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Items de venta de producto ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingreso_producto_items (
  id              SERIAL PRIMARY KEY,
  ingreso_id      INTEGER NOT NULL REFERENCES ingresos(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad        NUMERIC(10,3) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(10,2) NOT NULL
);

-- ─── Vista inventario de productos ────────────────────────────────────────────
DROP VIEW IF EXISTS vista_inventario_productos;
CREATE VIEW vista_inventario_productos AS
WITH total_compras AS (
  SELECT cpi.producto_id, cp.ciudad_id, SUM(cpi.cantidad) AS total
  FROM compra_producto_item cpi
  INNER JOIN compra_productos cp ON cp.id = cpi.compra_id
  GROUP BY cpi.producto_id, cp.ciudad_id
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
