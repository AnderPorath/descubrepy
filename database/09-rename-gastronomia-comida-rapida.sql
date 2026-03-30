-- Renombra la subcategoría Gastronomía "Comida rápida" a "Lomiterías"
-- y mantiene el slug existente para compatibilidad de URLs/filtros.

UPDATE subcategories s
SET title = 'Lomiterías'
FROM categories c
WHERE s.category_id = c.id
  AND c.slug = 'gastronomia'
  AND s.slug = 'comida-rapida';
