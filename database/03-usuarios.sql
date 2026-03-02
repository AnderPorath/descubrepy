-- ============================================
-- PARTE 3: Usuarios (admin y clientes)
-- Ejecutar después de 02-categorias-subcategorias.sql
-- ============================================
-- Desde terminal: mysql -u root -p descubrepy < database/03-usuarios.sql
--
-- Contraseña para admin y clientes de ejemplo: 12345678
-- (El hash corresponde a esa contraseña con bcrypt.)

USE descubrepy;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin (email: admin@descubrepy.com, contraseña: 12345678)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@descubrepy.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'admin');

-- Clientes de ejemplo (contraseña: 12345678)
INSERT INTO users (name, email, password_hash, role) VALUES
('Juan Pérez', 'juan@ejemplo.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'user'),
('María García', 'maria@ejemplo.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'user');

-- Verificar
SELECT id, name, email, role, created_at FROM users;
