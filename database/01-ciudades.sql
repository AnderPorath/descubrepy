-- ============================================
-- PARTE 1: Base de datos y ciudades
-- Base: descubrepy | Ejecutar primero
-- ============================================
-- Desde terminal: mysql -u root -p < database/01-ciudades.sql
-- (te pedirá la contraseña de MySQL; si es 12345678, usá esa)

CREATE DATABASE IF NOT EXISTS descubrepy
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE descubrepy;

-- Tabla de ciudades (para filtros y registro de empresas)
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ciudades de Paraguay (orden sugerido)
INSERT INTO cities (city, sort_order) VALUES
('Asunción', 1),
('Ciudad del Este', 2),
('Encarnación', 3),
('San Lorenzo', 4),
('Lambaré', 5),
('Fernando de la Mora', 6),
('Luque', 7),
('Capiatá', 8),
('Limpio', 9),
('Ñemby', 10),
('Pedro Juan Caballero', 11),
('Villarrica', 12),
('Coronel Oviedo', 13),
('Concepción', 14),
('Pilar', 15),
('Hernandarias', 16),
('Presidente Franco', 17),
('Itauguá', 18),
('Mariano Roque Alonso', 19),
('Villa Elisa', 20);

-- Verificar
SELECT * FROM cities ORDER BY sort_order;
