-- ─── Módulo Cuentas: Caja y Banco por Ciudad ─────────────────────────────────

-- 1. Método de pago en compras (efectivo / transferencia)
ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS metodo VARCHAR(20) NOT NULL DEFAULT 'efectivo'
    CHECK (metodo IN ('efectivo', 'transferencia'));

-- 2. Costo calculado en traslados (promedio ponderado al confirmar)
ALTER TABLE traslados
  ADD COLUMN IF NOT EXISTS costo_calculado NUMERIC(10,2);

-- 3. Saldo inicial configurable por ciudad y tipo de cuenta
CREATE TABLE IF NOT EXISTS saldo_inicial (
  id          SERIAL PRIMARY KEY,
  ciudad_id   INTEGER NOT NULL REFERENCES ciudades(id),
  tipo        VARCHAR(10) NOT NULL CHECK (tipo IN ('caja', 'banco')),
  monto       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (monto >= 0),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by  INTEGER REFERENCES usuarios(id),
  UNIQUE (ciudad_id, tipo)
);

-- 4. Movimientos extra (ingresos/gastos no vinculados a pacientes)
CREATE TABLE IF NOT EXISTS movimientos_extra (
  id          SERIAL PRIMARY KEY,
  tipo        VARCHAR(10)  NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  categoria   VARCHAR(60)  NOT NULL,
  descripcion TEXT,
  monto       NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo      VARCHAR(20)  NOT NULL CHECK (metodo IN ('efectivo', 'transferencia')),
  ciudad_id   INTEGER NOT NULL REFERENCES ciudades(id),
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_extra_ciudad_fecha
  ON movimientos_extra(ciudad_id, fecha DESC);
