-- ============================================
-- Corregir negocios de Gastronomía que quedaron sin subcategoría
-- (ej. hamburguesería creada cuando el formulario enviaba slug incorrecto)
-- ============================================
-- Ejecutar: mysql -u root -p descubrepy < database/corregir-subcategoria-hamburgueseria.sql
--
-- Asigna la subcategoría "Hamburguesería" a los negocios que están en Gastronomía
-- y tienen subcategory_id NULL. Si tenés varios, todos pasan a Hamburguesería;
-- si solo es uno (tu hamburguesería), ese se corrige.

USE descubrepy;

-- Ver qué negocios se van a actualizar (solo Gastronomía y sin subcategoría)
SELECT b.id, b.name, b.slug, c.title AS categoria, b.subcategory_id
FROM businesses b
JOIN categories c ON c.id = b.category_id
WHERE c.slug = 'gastronomia' AND b.subcategory_id IS NULL;

-- Asignar subcategoría "hamburgueseria" a esos negocios
UPDATE businesses b
JOIN categories c ON c.id = b.category_id
JOIN subcategories s ON s.category_id = c.id AND s.slug = 'hamburgueseria'
SET b.subcategory_id = s.id
WHERE c.slug = 'gastronomia' AND b.subcategory_id IS NULL;

-- Verificar
SELECT b.id, b.name, s.title AS subcategoria
FROM businesses b
JOIN categories c ON c.id = b.category_id
LEFT JOIN subcategories s ON s.id = b.subcategory_id
WHERE c.slug = 'gastronomia';
