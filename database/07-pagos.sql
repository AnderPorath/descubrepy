-- Pagos mensuales por negocio (módulo admin)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS monthly_amount INTEGER NOT NULL DEFAULT 0;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS plan VARCHAR(80) NOT NULL DEFAULT 'Estándar';

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  amount INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pagado', 'pendiente', 'vencido', 'no_corresponde')),
  payment_date DATE,
  payment_method VARCHAR(64),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_payment_business_year_month UNIQUE (business_id, year, month),
  CONSTRAINT fk_payment_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_business ON payments (business_id);
CREATE INDEX IF NOT EXISTS idx_payments_year_month ON payments (year, month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  admin_user_id INTEGER,
  admin_name VARCHAR(160),
  action VARCHAR(80) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ph_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_history_business ON payment_history (business_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history (created_at DESC);
