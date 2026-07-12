CREATE TABLE IF NOT EXISTS sesiones_asistente (
  id          SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  resumen     TEXT NOT NULL DEFAULT '',
  activa      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sesion_asistente_activa
  ON sesiones_asistente(paciente_id) WHERE activa = TRUE;
