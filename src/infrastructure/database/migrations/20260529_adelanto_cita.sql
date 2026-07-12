-- Configuración de la clínica (QR de pago y monto adelanto)
CREATE TABLE IF NOT EXISTS config_clinica (
  id              SERIAL PRIMARY KEY,
  qr_drive_link   TEXT,
  adelanto_monto  DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Fila única de configuración
INSERT INTO config_clinica (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Nuevos campos en citas_medicas para el adelanto
ALTER TABLE citas_medicas
  ADD COLUMN IF NOT EXISTS adelanto_monto   DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS adelanto_metodo  VARCHAR(20),
  ADD COLUMN IF NOT EXISTS comprobante_path TEXT;
