-- Convertir columna dias_semana de TEXT a TEXT[]
-- Los valores existentes tienen formato PostgreSQL: {LUNES,MARTES}
ALTER TABLE agenda
  ALTER COLUMN dias_semana TYPE TEXT[]
  USING CASE
    WHEN dias_semana IS NULL THEN NULL
    ELSE string_to_array(trim(both '{}' from dias_semana), ',')
  END;
