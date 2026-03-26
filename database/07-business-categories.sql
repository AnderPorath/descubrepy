-- Soporte de múltiples categorías por negocio

CREATE TABLE IF NOT EXISTS business_categories (
  business_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, category_id),
  CONSTRAINT fk_bc_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bc_business ON business_categories (business_id);
CREATE INDEX IF NOT EXISTS idx_bc_category ON business_categories (category_id);

-- Backfill de categoría principal actual
INSERT INTO business_categories (business_id, category_id)
SELECT id, category_id FROM businesses
ON CONFLICT (business_id, category_id) DO NOTHING;
