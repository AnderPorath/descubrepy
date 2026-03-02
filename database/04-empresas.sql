-- ============================================
-- PARTE 4: Tabla de empresas (negocios)
-- Ejecutar después de 03-usuarios.sql
-- ============================================
-- Desde terminal: mysql -u root -p descubrepy < database/04-empresas.sql
--
-- Esta tabla es la que usa el formulario "Registrar empresa" del admin.
-- Las empresas se crean desde la app; acá solo se crea la estructura.

USE descubrepy;

DROP TABLE IF EXISTS businesses;

CREATE TABLE businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  subcategory_id INT DEFAULT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  city VARCHAR(120) NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT NULL,
  longitude DECIMAL(11, 8) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  opening_hours TEXT DEFAULT NULL,
  menu_services TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  gallery_images JSON DEFAULT NULL,
  rating DECIMAL(2, 1) DEFAULT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug),
  KEY idx_category (category_id),
  KEY idx_subcategory (subcategory_id),
  KEY idx_city (city),
  CONSTRAINT fk_business_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_business_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verificar (debe listar columnas vacías)
SELECT COUNT(*) AS total_empresas FROM businesses;
