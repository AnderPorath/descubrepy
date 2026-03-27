-- Subcategorías adicionales por negocio (misma categoría principal)

CREATE TABLE IF NOT EXISTS business_subcategories (
  business_id INTEGER NOT NULL,
  subcategory_id INTEGER NOT NULL,
  PRIMARY KEY (business_id, subcategory_id),
  CONSTRAINT fk_bsub_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_bsub_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bsub_sub ON business_subcategories (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_bsub_biz ON business_subcategories (business_id);

INSERT INTO business_subcategories (business_id, subcategory_id)
SELECT id, subcategory_id FROM businesses
WHERE subcategory_id IS NOT NULL
ON CONFLICT (business_id, subcategory_id) DO NOTHING;
