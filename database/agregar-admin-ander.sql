-- ============================================
-- Agregar usuario admin: Ander Alejandro Porath Ramirez
-- Email: anderpthramirez@gmail.com
-- Contraseña: @Ander334
-- ============================================
-- Ejecutar: mysql -u root -p descubrepy < database/agregar-admin-ander.sql
--
-- Si ya existe un usuario con ese email, borrarlo antes o cambiar el email abajo.


USE descubrepy;

-- Opcional: eliminar si ya existía este email (descomentá la línea siguiente si querés reemplazar)
-- DELETE FROM users WHERE email = 'anderpthramirez@gmail.com';

INSERT INTO users (name, email, password_hash, role) VALUES
('Ander Alejandro Porath Ramirez', 'anderpthramirez@gmail.com', '$2a$10$aFKt9h.HX6GvVYumoT8n3uPs0CRkXCO/YhAb3TelMrafXksur0vP2', 'admin');

-- Verificar
SELECT id, name, email, role, created_at FROM users WHERE email = 'anderpthramirez@gmail.com';