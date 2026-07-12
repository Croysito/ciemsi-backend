CREATE TABLE IF NOT EXISTS traspasos_cuenta (
  id          SERIAL PRIMARY KEY,
  ciudad_id   INT            NOT NULL REFERENCES ciudades(id),
  tipo        VARCHAR(20)    NOT NULL CHECK (tipo IN ('efectivo_a_banco', 'banco_a_efectivo')),
  monto       DECIMAL(12, 2) NOT NULL CHECK (monto > 0),
  descripcion TEXT,
  fecha       TIMESTAMP      NOT NULL DEFAULT NOW(),
  usuario_id  INT            NOT NULL REFERENCES usuarios(id)
);
