-- ============================================
-- Favoritos: relación usuario – negocio
-- Ejecutar después de 04-empresas.sql
-- ============================================
-- Desde terminal: mysql -u root -p descubrepy < database/05-favoritos.sql

USE descubrepy;

CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_business (user_id, business_id),
  KEY idx_user (user_id),
  KEY idx_business (business_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
