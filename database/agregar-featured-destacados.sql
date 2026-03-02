-- ============================================
-- Agregar columna "featured" y/o marcar negocios como destacados
-- ============================================
-- Ejecutar en MySQL Workbench (o: mysql -u root -p descubrepy < database/agregar-featured-destacados.sql)

USE descubrepy;

-- 1) Agregar la columna "featured" si no existe
--    (Si da error "Duplicate column name 'featured'", la columna ya existe; podés ignorar y seguir.)
ALTER TABLE businesses ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0;

-- 2) Ver qué negocios tenés y cuáles están destacados
SELECT id, name, slug, featured FROM businesses ORDER BY name;

-- 3) Marcar UN negocio como destacado por su slug (cambiá 'tu-negocio-slug' por el slug real)
--    El slug es el que aparece en la URL: /negocio/ESTE-ES-EL-SLUG
UPDATE businesses SET featured = 1 WHERE slug = 'tu-negocio-slug';

-- Ejemplo si tu negocio se llama "Mi Hamburgueseria" y el slug es "mi-hamburgueseria":
-- UPDATE businesses SET featured = 1 WHERE slug = 'mi-hamburgueseria';

-- 4) (Opcional) Marcar TODOS los negocios actuales como destacados
-- UPDATE businesses SET featured = 1;

-- 5) Verificar: deberían aparecer con featured = 1
SELECT id, name, slug, featured FROM businesses WHERE featured = 1;
