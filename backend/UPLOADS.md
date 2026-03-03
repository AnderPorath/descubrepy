# Fotos de negocios (uploads)

En **Render** (y en la mayoría de PaaS) el disco del servidor es **efímero**: los archivos subidos se pierden en cada redeploy o reinicio. Para que las fotos **no desaparezcan** hay que usar una carpeta persistente.

## Disco persistente en Render

1. En el dashboard de Render, en tu **Web Service** del backend, entrá a **Disks** y agregá un disco persistente (ej. 1 GB). Render lo monta en una ruta como `/opt/render/project/data` (la ruta exacta aparece en la configuración del disco).

2. En **Environment** del mismo servicio, agregá la variable:
   ```bash
   UPLOAD_DIR=/opt/render/project/data/uploads
   ```
   (Usá la ruta que Render te indique para el disco + `/uploads`.)

3. El backend ya está configurado: si `NODE_ENV=production` y `UPLOAD_DIR` está definido, guarda y sirve las fotos desde esa carpeta. Así las imágenes persisten entre redeploys.

En **desarrollo** no hace falta definir `UPLOAD_DIR`; se usa `backend/public/uploads`.

## Alternativa: almacenamiento en la nube

Para no depender del disco del servidor, podés subir las imágenes a **AWS S3**, **Cloudinary** o similar y guardar en la base de datos la URL pública. Requiere cambiar el endpoint de upload para enviar el archivo a ese servicio.
