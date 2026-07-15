-- Permisos de módulos habilitados por asistente individual (no por rol)
CREATE TABLE IF NOT EXISTS asistente_permisos (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo     VARCHAR(50) NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(usuario_id, modulo)
);
