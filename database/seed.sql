-- PostgreSQL seed data for DescubrePY
-- Ejecutar DESPUÉS de database/schema.sql

BEGIN;

-- Ciudades
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
('Villa Elisa', 20)
ON CONFLICT (city) DO NOTHING;

-- Categorías (20)
INSERT INTO categories (slug, title, description, icon_name, business_count, sort_order) VALUES
('gastronomia', 'Gastronomía', 'Restaurantes, bares, cafeterías y más', 'UtensilsCross', 0, 1),
('belleza-y-spa', 'Belleza y Spa', 'Peluquerías, spa, estética', 'Scissors', 0, 2),
('fitness', 'Fitness', 'Gimnasios, yoga, pilates', 'Dumbbell', 0, 3),
('cafeterias', 'Cafeterías', 'Café, panaderías, confiterías', 'Coffee', 0, 4),
('salud', 'Salud', 'Clínicas, farmacias, odontología', 'Stethoscope', 0, 5),
('automotriz', 'Automotriz', 'Talleres, lubricentros, concesionarias', 'Wrench', 0, 6),
('moda', 'Moda', 'Ropa, calzado, accesorios', 'ShoppingBag', 0, 7),
('hoteleria', 'Hotelería', 'Hoteles, hostels, alojamiento', 'Building2', 0, 8),
('educacion', 'Educación', 'Idiomas, música, cursos', 'GraduationCap', 0, 9),
('transporte', 'Transporte', 'Taxis, remises, envíos', 'Car', 0, 10),
('servicios', 'Servicios', 'Plomería, electricidad, mudanzas', 'Briefcase', 0, 11),
('bienestar', 'Bienestar', 'Psicología, masajes, nutrición', 'Heart', 0, 12),
('mascotas', 'Mascotas', 'Veterinarias, tiendas para mascotas', 'Dog', 0, 13),
('legal', 'Legal', 'Abogacía, asesoría legal', 'Scale', 0, 14),
('inmobiliarias', 'Inmobiliarias', 'Ventas, alquileres, administración', 'Home', 0, 15),
('farmacias', 'Farmacias', 'Farmacias y droguerías', 'Pill', 0, 16),
('supermercados', 'Supermercados', 'Supermercados, minimercados', 'ShoppingCart', 0, 17),
('fotografia', 'Fotografía', 'Estudios, eventos, impresión', 'Camera', 0, 18),
('eventos', 'Eventos', 'Salones, catering, decoración', 'Calendar', 0, 19),
('tecnologia', 'Tecnología', 'Reparación celulares, informática', 'Smartphone', 0, 20)
ON CONFLICT (slug) DO NOTHING;

-- Subcategorías (mismo enfoque que MySQL: insertar por slug de categoría)

-- Gastronomía
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'pizzeria', 'Pizzería', 1 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'hamburgueseria', 'Hamburguesería', 2 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'parrilla', 'Parrilla', 3 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'sushi', 'Sushi', 4 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'comida-rapida', 'Comida rápida', 5 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'comida-internacional', 'Comida internacional', 6 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'postres-reposteria', 'Postres y repostería', 7 FROM categories WHERE slug = 'gastronomia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Belleza y Spa
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'peluquerias', 'Peluquerías', 1 FROM categories WHERE slug = 'belleza-y-spa' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'barberias', 'Barberías', 2 FROM categories WHERE slug = 'belleza-y-spa' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'spa', 'Spa', 3 FROM categories WHERE slug = 'belleza-y-spa' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'unas', 'Uñas', 4 FROM categories WHERE slug = 'belleza-y-spa' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'estetica', 'Estética', 5 FROM categories WHERE slug = 'belleza-y-spa' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Fitness
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'gimnasios', 'Gimnasios', 1 FROM categories WHERE slug = 'fitness' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'yoga', 'Yoga', 2 FROM categories WHERE slug = 'fitness' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'pilates', 'Pilates', 3 FROM categories WHERE slug = 'fitness' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'crossfit', 'CrossFit', 4 FROM categories WHERE slug = 'fitness' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'nutricion-deportiva', 'Nutrición deportiva', 5 FROM categories WHERE slug = 'fitness' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Cafeterías
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'cafe-especialidad', 'Café de especialidad', 1 FROM categories WHERE slug = 'cafeterias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'panaderias', 'Panaderías', 2 FROM categories WHERE slug = 'cafeterias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'confiterias', 'Confiterías', 3 FROM categories WHERE slug = 'cafeterias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Salud
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'clinica', 'Clínica', 1 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'farmacia', 'Farmacia', 2 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'gimnasio', 'Gimnasio', 3 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'odontologia', 'Odontología', 4 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'pediatria', 'Pediatría', 5 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'laboratorios', 'Laboratorios', 6 FROM categories WHERE slug = 'salud' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Automotriz
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'talleres-mecanicos', 'Talleres mecánicos', 1 FROM categories WHERE slug = 'automotriz' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'lubricentros', 'Lubricentros', 2 FROM categories WHERE slug = 'automotriz' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'cerrajeria-automotriz', 'Cerrajería automotriz', 3 FROM categories WHERE slug = 'automotriz' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'concesionarias', 'Concesionarias', 4 FROM categories WHERE slug = 'automotriz' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Moda
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'ropa-mujer', 'Ropa mujer', 1 FROM categories WHERE slug = 'moda' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'ropa-hombre', 'Ropa hombre', 2 FROM categories WHERE slug = 'moda' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'calzado', 'Calzado', 3 FROM categories WHERE slug = 'moda' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'accesorios', 'Accesorios', 4 FROM categories WHERE slug = 'moda' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'boutiques', 'Boutiques', 5 FROM categories WHERE slug = 'moda' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Hotelería
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'hoteles', 'Hoteles', 1 FROM categories WHERE slug = 'hoteleria' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'hostels', 'Hostels', 2 FROM categories WHERE slug = 'hoteleria' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'apart-hoteles', 'Apart hoteles', 3 FROM categories WHERE slug = 'hoteleria' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'posadas', 'Posadas', 4 FROM categories WHERE slug = 'hoteleria' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Educación
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'idiomas', 'Idiomas', 1 FROM categories WHERE slug = 'educacion' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'musica', 'Música', 2 FROM categories WHERE slug = 'educacion' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'informatica', 'Informática', 3 FROM categories WHERE slug = 'educacion' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'cursos-talleres', 'Cursos y talleres', 4 FROM categories WHERE slug = 'educacion' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Transporte
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'taxis', 'Taxis', 1 FROM categories WHERE slug = 'transporte' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'remises', 'Remises', 2 FROM categories WHERE slug = 'transporte' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'envios', 'Envíos', 3 FROM categories WHERE slug = 'transporte' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'alquiler-autos', 'Alquiler de autos', 4 FROM categories WHERE slug = 'transporte' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Servicios
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'plomeria', 'Plomería', 1 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'electricidad', 'Electricidad', 2 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'limpieza', 'Limpieza', 3 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'mudanzas', 'Mudanzas', 4 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'abogacia', 'Abogacía', 5 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'contabilidad', 'Contabilidad', 6 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'reparaciones', 'Reparaciones', 7 FROM categories WHERE slug = 'servicios' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Bienestar
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'psicologia', 'Psicología', 1 FROM categories WHERE slug = 'bienestar' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'masajes', 'Masajes', 2 FROM categories WHERE slug = 'bienestar' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'meditacion', 'Meditación', 3 FROM categories WHERE slug = 'bienestar' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'nutricion', 'Nutrición', 4 FROM categories WHERE slug = 'bienestar' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Mascotas
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'veterinarias', 'Veterinarias', 1 FROM categories WHERE slug = 'mascotas' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'tiendas-mascotas', 'Tiendas para mascotas', 2 FROM categories WHERE slug = 'mascotas' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'peluqueria-canina', 'Peluquería canina', 3 FROM categories WHERE slug = 'mascotas' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Legal
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'civil', 'Derecho civil', 1 FROM categories WHERE slug = 'legal' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'laboral', 'Derecho laboral', 2 FROM categories WHERE slug = 'legal' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'inmobiliario', 'Derecho inmobiliario', 3 FROM categories WHERE slug = 'legal' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Inmobiliarias
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'ventas', 'Ventas', 1 FROM categories WHERE slug = 'inmobiliarias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'alquileres', 'Alquileres', 2 FROM categories WHERE slug = 'inmobiliarias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'administracion', 'Administración', 3 FROM categories WHERE slug = 'inmobiliarias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Farmacias
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'farmacias', 'Farmacias', 1 FROM categories WHERE slug = 'farmacias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'droguerias', 'Droguerías', 2 FROM categories WHERE slug = 'farmacias' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Supermercados
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'supermercados', 'Supermercados', 1 FROM categories WHERE slug = 'supermercados' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'minimercados', 'Minimercados', 2 FROM categories WHERE slug = 'supermercados' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'almacenes', 'Almacenes', 3 FROM categories WHERE slug = 'supermercados' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Fotografía
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'estudios', 'Estudios fotográficos', 1 FROM categories WHERE slug = 'fotografia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'eventos', 'Fotografía de eventos', 2 FROM categories WHERE slug = 'fotografia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'impresion', 'Impresión', 3 FROM categories WHERE slug = 'fotografia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Eventos
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'salones', 'Salones de eventos', 1 FROM categories WHERE slug = 'eventos' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'catering', 'Catering', 2 FROM categories WHERE slug = 'eventos' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'decoracion', 'Decoración', 3 FROM categories WHERE slug = 'eventos' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'musica-vivo', 'Música en vivo', 4 FROM categories WHERE slug = 'eventos' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Tecnología
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'reparacion-celulares', 'Reparación de celulares', 1 FROM categories WHERE slug = 'tecnologia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'informatica', 'Informática', 2 FROM categories WHERE slug = 'tecnologia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO subcategories (category_id, slug, title, sort_order)
SELECT id, 'electronica', 'Electrónica', 3 FROM categories WHERE slug = 'tecnologia' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Usuarios de ejemplo (hash de contraseña: 12345678)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@descubrepy.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'admin'),
('Juan Pérez', 'juan@ejemplo.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'user'),
('María García', 'maria@ejemplo.com', '$2a$10$JQM9WWlHGt1OVt33xhwDhujv1mMcdPO8l4Z4jSsafodw7w5VLDOAW', 'user')
ON CONFLICT (email) DO NOTHING;

COMMIT;

