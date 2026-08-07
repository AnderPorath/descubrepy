-- Imagen de cupón por negocio (descuentos)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS discount_coupon_url VARCHAR(500);
