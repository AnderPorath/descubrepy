# Configuración del correo (formulario "Solicitá tu publicación")

Para que el formulario **Anunciate** / **Solicitá tu publicación** envíe el correo a `descubrepy.com.py@gmail.com`, tenés que configurar el envío en el backend.

## Pasos

1. **Crear una contraseña de aplicación en Google**
   - Entrá a [Contraseñas de aplicación (Google)](https://myaccount.google.com/apppasswords).
   - Si no ves la opción, activá la verificación en 2 pasos en tu cuenta de Google.
   - Creá una contraseña para "Correo" / "Mail".
   - Copiá la contraseña de 16 caracteres (ej. `abcd efgh ijkl mnop`).

2. **Configurar el backend**
   - En la carpeta `backend`, creá o editá el archivo `.env` (no lo subas a Git).
   - Agregá o descomentá estas líneas (reemplazá con el email y la contraseña de aplicación):

   ```
   EMAIL_USER=descubrepy.com.py@gmail.com
   EMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

   - No uses espacios en `EMAIL_APP_PASSWORD` (si Google te dio "abcd efgh...", poné `abcdefghijklmnop`).

3. **Reiniciar el servidor**
   - Reiniciá el backend para que tome las nuevas variables.

4. **Probar**
   - Enviá el formulario de "Solicitá tu publicación" de nuevo.
   - Opcional: `GET http://localhost:6000/api/test-email` (o la URL de tu backend + `/api/test-email`) para verificar que el correo se envía.

Si no configurás el correo, el formulario mostrará un mensaje amigable al usuario indicando que contacte por otro medio; no se mostrarán detalles técnicos del `.env`.
