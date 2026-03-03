# Fotos de negocios (uploads)

En **Render** (y en la mayoría de PaaS) el disco del servidor es **efímero**: los archivos subidos se pierden en cada redeploy o reinicio. Por eso las imágenes pueden devolver 404 aunque se hayan subido correctamente.

**Opciones para producción:**

1. **Disco persistente en Render**  
   En el dashboard de Render podés agregar un "Disk" persistente a tu servicio y montar esa ruta como `UPLOAD_DIR` en el backend (variable de entorno o cambio en el código).

2. **Almacenamiento en la nube (recomendado)**  
   Subir las imágenes a **AWS S3**, **Cloudinary** o similar y guardar en la base de datos la URL pública. Así las fotos persisten y no dependen del servidor.

Mientras tanto, el frontend muestra un **placeholder** cuando la imagen falla (404).
