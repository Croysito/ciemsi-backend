-- Épica 6: Pagos y Deudas

-- 1. Tabla principal de ingresos (comprobante de cobro)
CREATE TABLE IF NOT EXISTS ingresos (
  id          SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  cita_id     INTEGER REFERENCES citas_medicas(id),
  ciudad_id   INTEGER NOT NULL REFERENCES ciudades(id),
  tipo_origen VARCHAR(20) NOT NULL
                CHECK (tipo_origen IN ('primera_cita', 'cita', 'libre')),
  descripcion TEXT,
  monto_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by  INTEGER NOT NULL REFERENCES usuarios(id)
);

-- 2. Items detallados del ingreso (líneas de cobro)
CREATE TABLE IF NOT EXISTS ingreso_items (
  id              SERIAL PRIMARY KEY,
  ingreso_id      INTEGER NOT NULL REFERENCES ingresos(id) ON DELETE CASCADE,
  tipo            VARCHAR(20) NOT NULL
                    CHECK (tipo IN ('tratamiento', 'producto', 'otro')),
  referencia_id   INTEGER,  -- tratamiento_asignado.id | suministros.id según tipo
  descripcion     TEXT NOT NULL,
  cantidad        NUMERIC(10,3) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(10,2) NOT NULL
);

-- 3. Cobros realizados contra un ingreso (puede ser parcial)
CREATE TABLE IF NOT EXISTS cobros (
  id          SERIAL PRIMARY KEY,
  ingreso_id  INTEGER NOT NULL REFERENCES ingresos(id),
  monto       NUMERIC(10,2) NOT NULL,
  metodo      VARCHAR(20) NOT NULL CHECK (metodo IN ('efectivo', 'qr')),
  fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
  notas       TEXT,
  created_by  INTEGER NOT NULL REFERENCES usuarios(id)
);

-- 4. Deudas auto-generadas cuando total_cobrado < monto_total
CREATE TABLE IF NOT EXISTS deudas (
  id              SERIAL PRIMARY KEY,
  paciente_id     INTEGER NOT NULL REFERENCES pacientes(id),
  ingreso_id      INTEGER NOT NULL REFERENCES ingresos(id),
  monto_pendiente NUMERIC(10,2) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagada')),
  fecha_limite    DATE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Actualizar vista_inventario para incluir ventas de productos como salidas
DROP VIEW IF EXISTS vista_inventario;

CREATE VIEW vista_inventario AS
WITH total_compras AS (
  SELECT
    cs.suministro_id,
    c.ciudad_id,
    SUM(cs.cantidad) AS total
  FROM compra_suministro cs
  INNER JOIN compras c ON c.id = cs.compra_id
  GROUP BY cs.suministro_id, c.ciudad_id
),
total_salidas_tratamientos AS (
  SELECT
    asu.suministro_id,
    cm.ciudad_id,
    SUM(asu.cantidad) AS total
  FROM asignado_suministro asu
  INNER JOIN tratamiento_asignado ta ON ta.id = asu.tratamiento_asignado_id
  INNER JOIN citas_medicas cm ON cm.id = ta.cita_id
  WHERE ta.estado = 'COMPLETADO'
  GROUP BY asu.suministro_id, cm.ciudad_id
),
total_ventas_productos AS (
  SELECT
    ii.referencia_id AS suministro_id,
    i.ciudad_id,
    SUM(ii.cantidad) AS total
  FROM ingreso_items ii
  INNER JOIN ingresos i ON i.id = ii.ingreso_id
  WHERE ii.tipo = 'producto'
  GROUP BY ii.referencia_id, i.ciudad_id
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
  (COALESCE(tst.total, 0) + COALESCE(tvp.total, 0))::bigint AS total_salidas,
  (COALESCE(tc.total, 0) - COALESCE(tst.total, 0) - COALESCE(tvp.total, 0))::bigint AS saldo,
  CASE
    WHEN COALESCE(tc.total, 0) - COALESCE(tst.total, 0) - COALESCE(tvp.total, 0) < s.umbral THEN true
    ELSE false
  END AS stock_bajo
FROM suministros s
CROSS JOIN ciudades ci
LEFT JOIN total_compras tc
  ON tc.suministro_id = s.id AND tc.ciudad_id = ci.id
LEFT JOIN total_salidas_tratamientos tst
  ON tst.suministro_id = s.id AND tst.ciudad_id = ci.id
LEFT JOIN total_ventas_productos tvp
  ON tvp.suministro_id = s.id AND tvp.ciudad_id = ci.id
WHERE s.estado = true;
