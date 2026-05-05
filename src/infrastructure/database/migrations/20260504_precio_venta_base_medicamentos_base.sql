-- 1. Precio de venta base por lote de compra (solo medicamentos)
ALTER TABLE compra_suministro
  ADD COLUMN IF NOT EXISTS precio_venta_base NUMERIC(10,2);

-- 2. Medicamentos base plantilla de un tratamiento
CREATE TABLE IF NOT EXISTS tratamiento_medicamento_base (
  id           SERIAL PRIMARY KEY,
  tratamiento_id INT NOT NULL REFERENCES tratamientos(id) ON DELETE CASCADE,
  suministro_id  INT NOT NULL REFERENCES suministros(id),
  cantidad       INT NOT NULL DEFAULT 1
);
