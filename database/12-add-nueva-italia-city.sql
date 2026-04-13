INSERT INTO cities (city, sort_order)
VALUES ('Nueva Italia', 22)
ON CONFLICT (city) DO NOTHING;
