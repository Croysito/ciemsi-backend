-- Tabla directa que vincula agendas con los servicios que ofrecen
CREATE TABLE IF NOT EXISTS agenda_servicios (
  id          SERIAL PRIMARY KEY,
  agenda_id   INTEGER NOT NULL REFERENCES agenda(id) ON DELETE CASCADE,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  UNIQUE(agenda_id, servicio_id)
);

-- Poblar desde los datos existentes: rol del usuario de la agenda → servicios_rol
INSERT INTO agenda_servicios (agenda_id, servicio_id)
SELECT a.id, sr.servicio_id
FROM agenda a
INNER JOIN usuarios u  ON u.id  = a.usuario_id
INNER JOIN roles r     ON r.id  = u.rol_id
INNER JOIN servicios_rol sr ON sr.rol = r.nombre_rol
ON CONFLICT DO NOTHING;
