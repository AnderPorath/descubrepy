-- Renombra la subcategoría Gastronomía "Parrilla" a "Pollería"
-- Mantiene el slug "parrilla" para compatibilidad.

UPDATE subcategories s
SET title = 'Pollería'
FROM categories c
WHERE s.category_id = c.id
  AND c.slug = 'gastronomia'
  AND s.slug = 'parrilla';
