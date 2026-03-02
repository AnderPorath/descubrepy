-- ============================================
-- Agregar red social Instagram a empresas
-- Ejecutar: mysql -u root -p descubrepy < database/06-instagram.sql
-- ============================================

USE descubrepy;

ALTER TABLE businesses
  ADD COLUMN instagram_url VARCHAR(500) DEFAULT NULL
  AFTER phone;
