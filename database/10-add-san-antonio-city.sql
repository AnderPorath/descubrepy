-- Agrega la ciudad de San Antonio (Central) si no existe.
INSERT INTO cities (city, sort_order)
VALUES ('San Antonio', 21)
ON CONFLICT (city) DO NOTHING;
