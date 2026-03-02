# Base de datos descubrepy

Base de datos: **descubrepy**

## PostgreSQL (recomendado / Render)

Ejecutá desde la raíz del proyecto (requiere `psql` y `DATABASE_URL`):

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

## MySQL (legacy)

Contraseña MySQL (si usás la que indicaste): **12345678**

## Orden de ejecución (MySQL)

Ejecutá los SQL **en este orden**, desde la raíz del proyecto:

1. **Ciudades** (crea la base y la tabla `cities`):
   ```bash
   mysql -u root -p < database/01-ciudades.sql
   ```
   Si ya tenés la base creada y solo querés las tablas:
   ```bash
   mysql -u root -p descubrepy < database/01-ciudades.sql
   ```

2. **Categorías y subcategorías**:
   ```bash
   mysql -u root -p descubrepy < database/02-categorias-subcategorias.sql
   ```

3. **Usuarios** (admin + 2 clientes de ejemplo; contraseña: 12345678):
   ```bash
   mysql -u root -p descubrepy < database/03-usuarios.sql
   ```

4. **Empresas** (tabla para el registro de negocios):
   ```bash
   mysql -u root -p descubrepy < database/04-empresas.sql
   ```

5. **Favoritos** (tabla para que los clientes guarden locales favoritos):
   ```bash
   mysql -u root -p descubrepy < database/05-favoritos.sql
   ```

6. **Instagram en empresas** (agrega columna `instagram_url` a `businesses`):
   ```bash
   mysql -u root -p descubrepy < database/06-instagram.sql
   ```

## Backend

En la carpeta `backend` configurá el `.env` para usar esta base:

- **PostgreSQL**: `DATABASE_URL=...` (y opcional `DATABASE_SSL=true`)
- **MySQL (legacy)**: `DB_NAME=descubrepy`, `DB_PASSWORD=12345678`

## Usuarios de ejemplo

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@descubrepy.com | 12345678 | admin |
| juan@ejemplo.com | 12345678 | cliente |
| maria@ejemplo.com | 12345678 | cliente |
