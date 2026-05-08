-- 1. Agregar usuario_id a agenda (nullable primero para no romper filas existentes)
ALTER TABLE agenda
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id);

-- 2. Tabla de servicios permitidos por rol
CREATE TABLE IF NOT EXISTS servicios_rol (
  id         SERIAL PRIMARY KEY,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  rol         VARCHAR(50) NOT NULL,
  UNIQUE(servicio_id, rol)
);

-- 3. Datos iniciales
-- Asistente: solo Tratamientos
INSERT INTO servicios_rol (servicio_id, rol)
  SELECT id, 'Asistente' FROM servicios WHERE nombre_servicio ILIKE '%tratamiento%'
  ON CONFLICT DO NOTHING;

-- Doctora: todos los servicios
INSERT INTO servicios_rol (servicio_id, rol)
  SELECT id, 'Doctora' FROM servicios
  ON CONFLICT DO NOTHING;
