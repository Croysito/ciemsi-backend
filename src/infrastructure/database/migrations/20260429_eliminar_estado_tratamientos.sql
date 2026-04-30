ALTER TABLE tratamiento_asignado
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';

UPDATE tratamiento_asignado ta
SET estado = COALESCE(t.estado, 'PENDIENTE')
FROM tratamientos t
WHERE ta.tratamiento_id = t.id
  AND ta.estado = 'PENDIENTE'
  AND t.estado IS NOT NULL;

ALTER TABLE tratamientos
DROP COLUMN IF EXISTS estado;

