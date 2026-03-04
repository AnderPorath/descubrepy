require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./db');
const { signToken, verifyToken } = require('./auth');
const { sendNewBusinessNotification, sendContactNotification, sendTestEmail } = require('./mail');

const app = express();
const PORT = process.env.PORT || 6000;

// En producción usar carpeta persistente (ej. disco en Render) para que las fotos no desaparezcan en redeploys
const UPLOAD_DIR =
  process.env.NODE_ENV === 'production' && process.env.UPLOAD_DIR
    ? process.env.UPLOAD_DIR.replace(/\/$/, '')
    : path.join(__dirname, '..', 'public', 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = (file.originalname && path.extname(file.originalname)) || '.jpg';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function addParam(params, value) {
  params.push(value);
  return `$${params.length}`;
}

/** Normaliza texto para comparar ciudad (minúsculas, sin acentos) */
function normalizeCity(str) {
  return String(str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Expresión SQL que normaliza city para comparar (quita acentos comunes) */
function sqlNormalizeCity(column) {
  const c = `LOWER(TRIM(${column}))`;
  return `REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${c}, 'á|à|ä|â', 'a', 'g'), 'é|è|ë|ê', 'e', 'g'), 'í|ì|ï|î', 'i', 'g'), 'ó|ò|ö|ô', 'o', 'g'), 'ú|ù|ü|û', 'u', 'g'), 'ñ', 'n', 'g')`;
}

async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Token inválido o expirado' });
  req.userId = payload.id;
  try {
    const result = await db.query('SELECT id, role FROM users WHERE id = $1', [payload.id]);
    const rows = result && Array.isArray(result.rows) ? result.rows : [];
    if (!rows.length || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden registrar empresas' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar usuario' });
  }
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Token inválido o expirado' });
  req.userId = payload.id;
  next();
}

// Raíz: evitar 404 si alguien abre http://localhost:6000
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'DescubrePY API', docs: 'Usar la app en http://localhost:3000' });
});

// Categorías (business_count = cantidad real de negocios con esa category_id)
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.slug, c.title, c.description, c.icon_name,
             (SELECT COUNT(*)::int FROM businesses b WHERE b.category_id = c.id) AS business_count,
             c.sort_order
      FROM categories c
      ORDER BY c.sort_order ASC
    `);
    const rows = result && Array.isArray(result.rows) ? result.rows : [];
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Subcategorías por categoría (?category=slug), con cantidad de negocios por subcategoría
app.get('/api/subcategories', async (req, res) => {
  try {
    const { category: categorySlug } = req.query || {};
    if (!categorySlug || !String(categorySlug).trim()) {
      return res.json([]);
    }
    const result = await db.query(
      `SELECT s.id, s.slug, s.title, s.sort_order,
              COALESCE(cnt.n, 0)::int AS business_count
       FROM subcategories s
       INNER JOIN categories c ON s.category_id = c.id
       LEFT JOIN (SELECT subcategory_id, COUNT(*) AS n FROM businesses GROUP BY subcategory_id) cnt ON cnt.subcategory_id = s.id
       WHERE c.slug = $1
       ORDER BY s.sort_order ASC, s.title ASC`,
      [String(categorySlug).trim()]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
});

// Negocios destacados (solo los que tienen featured = 1). Filtros: ?city=&category=&subcategory=
app.get('/api/featured', async (req, res) => {
  try {
    const { city: cityName, category: categorySlug, subcategory: subcategorySlug } = req.query || {};
    let sql = `
      SELECT b.id, b.name, b.slug, b.location, b.city, b.rating, b.image_url,
             CASE WHEN COALESCE(b.featured, false) THEN 1 ELSE 0 END AS featured,
             c.title AS category, c.slug AS category_slug
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN subcategories s ON b.subcategory_id = s.id
      WHERE COALESCE(b.featured, false) = true
    `;
    const params = [];
    if (categorySlug && String(categorySlug).trim()) {
      sql += ` AND LOWER(TRIM(c.slug)) = LOWER(${addParam(params, String(categorySlug).trim())})`;
    }
    if (subcategorySlug && String(subcategorySlug).trim()) {
      sql += ` AND LOWER(TRIM(s.slug)) = LOWER(${addParam(params, String(subcategorySlug).trim())})`;
    }
    if (cityName && String(cityName).trim()) {
      const norm = normalizeCity(cityName);
      sql += ` AND ${sqlNormalizeCity('b.city')} = ${addParam(params, norm)}`;
    }
    sql += ' ORDER BY b.rating DESC LIMIT 50';
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener destacados' });
  }
});

// Todas las ciudades (para el hero)
app.get('/api/cities', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT city FROM cities ORDER BY sort_order ASC, city ASC'
    );
    res.json(result.rows.map((r) => r.city));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});

// Listar negocios (opcional: ?category=slug&subcategory=slug&city=nombre&q=busqueda)
app.get('/api/businesses', async (req, res) => {
  try {
    const { category: categorySlug, subcategory: subcategorySlug, city: cityName, q } = req.query || {};
    let sql = `
      SELECT b.id, b.name, b.slug, b.location, b.city, b.rating, b.image_url,
             CASE WHEN COALESCE(b.featured, false) THEN 1 ELSE 0 END AS featured,
             c.title AS category, c.slug AS category_slug
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN subcategories s ON b.subcategory_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (categorySlug && String(categorySlug).trim()) {
      sql += ` AND LOWER(TRIM(c.slug)) = LOWER(${addParam(params, String(categorySlug).trim())})`;
    }
    if (subcategorySlug && String(subcategorySlug).trim()) {
      sql += ` AND LOWER(TRIM(s.slug)) = LOWER(${addParam(params, String(subcategorySlug).trim())})`;
    }
    if (cityName && String(cityName).trim()) {
      const norm = normalizeCity(cityName);
      sql += ` AND ${sqlNormalizeCity('b.city')} = ${addParam(params, norm)}`;
    }
    if (q && String(q).trim()) {
      const term = `%${String(q).trim()}%`;
      sql += ` AND (b.name ILIKE ${addParam(params, term)} OR b.location ILIKE ${addParam(params, term)} OR b.city ILIKE ${addParam(params, term)})`;
    }
    sql += ' ORDER BY COALESCE(b.featured, false) DESC, (b.rating IS NOT NULL) DESC, b.rating DESC';
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener negocios' });
  }
});

// Un negocio por slug (incluye descripción, teléfono, horarios, menú, galería)
app.get('/api/businesses/:slug', async (req, res) => {
  try {
    const slug = (req.params.slug || '').trim();
    if (!slug) return res.status(404).json({ error: 'Negocio no encontrado' });
    const result = await db.query(
      `SELECT b.id, b.name, b.slug, b.location, b.latitude, b.longitude, b.city, b.rating, b.image_url,
              CASE WHEN COALESCE(b.featured, false) THEN 1 ELSE 0 END AS featured,
              b.description, b.phone, b.instagram_url, b.opening_hours, b.menu_services, b.gallery_images,
              c.title AS category, c.slug AS category_slug, s.slug AS subcategory_slug
       FROM businesses b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN subcategories s ON b.subcategory_id = s.id
       WHERE LOWER(TRIM(b.slug)) = LOWER($1)`,
      [slug]
    );
    const rows = result.rows;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }
    const row = rows[0];
    if (row.gallery_images && typeof row.gallery_images === 'string') {
      try {
        row.gallery_images = JSON.parse(row.gallery_images);
      } catch {
        row.gallery_images = [];
      }
    }
    if (!Array.isArray(row.gallery_images)) row.gallery_images = [];
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener negocio' });
  }
});

// Crear negocio (solo admin)
app.post('/api/businesses', requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const {
      name,
      subcategory_slug,
      city,
      location,
      latitude,
      longitude,
      description,
      phone,
      instagram_url,
      opening_hours,
      menu_services,
      image_url,
      gallery_images,
    } = body;
    const featured = body.featured === true || body.featured === 1 || body.featured === '1';
    const category_slug = body.category_slug ?? body.categorySlug;
    if (!name?.trim() || !String(category_slug || '').trim() || !city?.trim()) {
      return res.status(400).json({ error: 'Nombre, categoría y ciudad son obligatorios' });
    }
    const slugTrim = String(category_slug).trim();
    const catResult = await db.query('SELECT id FROM categories WHERE LOWER(TRIM(slug)) = LOWER($1)', [slugTrim]);
    const catRow = catResult.rows?.[0];
    if (!catRow) {
      const countResult = await db.query('SELECT COUNT(*)::int AS n FROM categories');
      const countRow = countResult.rows?.[0];
      const total = countRow?.n ?? 0;
      console.error('[POST /api/businesses] Categoría no encontrada. Slug recibido:', slugTrim, '| Total categorías en DB:', total);
      const msg = total === 0
        ? 'La tabla categories está vacía. Cargá el schema y seed de PostgreSQL: psql "$DATABASE_URL" -f database/schema.sql && psql "$DATABASE_URL" -f database/seed.sql'
        : `No hay categoría con slug "${slugTrim}". Revisá que el slug coincida con los de la base.`;
      return res.status(400).json({ error: msg, received_slug: slugTrim });
    }
    const category_id = catRow.id;
    let subcategory_id = null;
    if (subcategory_slug?.trim()) {
      const subSlug = String(subcategory_slug).trim();
      const subResult = await db.query(
        'SELECT id FROM subcategories WHERE category_id = $1 AND LOWER(TRIM(slug)) = LOWER($2)',
        [category_id, subSlug]
      );
      const subRow = subResult.rows?.[0];
      if (subRow) subcategory_id = subRow.id;
    }
    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = 'negocio';
    let slug = baseSlug;
    let n = 1;
    while (true) {
      const existingResult = await db.query('SELECT id FROM businesses WHERE slug = $1', [slug]);
      if (!existingResult.rows?.length) break;
      slug = `${baseSlug}-${++n}`;
    }
    let galleryVal = null;
    if (Array.isArray(gallery_images)) {
      galleryVal = gallery_images;
    } else if (typeof gallery_images === 'string' && gallery_images.trim()) {
      try {
        const parsed = JSON.parse(gallery_images);
        if (Array.isArray(parsed)) galleryVal = parsed;
      } catch {
        galleryVal = null;
      }
    }
    const galleryJson = galleryVal ? JSON.stringify(galleryVal) : null;
    const lat = latitude != null && latitude !== '' ? parseFloat(latitude) : null;
    const lng = longitude != null && longitude !== '' ? parseFloat(longitude) : null;
    await db.query(
      `INSERT INTO businesses (
        category_id, subcategory_id, name, slug, location, city, latitude, longitude,
        description, phone, instagram_url, opening_hours, menu_services, image_url, gallery_images, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16)`,
      [
        category_id,
        subcategory_id,
        name.trim(),
        slug,
        location?.trim() || null,
        city.trim(),
        Number.isFinite(lat) ? lat : null,
        Number.isFinite(lng) ? lng : null,
        description?.trim() || null,
        phone?.trim() || null,
        instagram_url?.trim() || null,
        opening_hours?.trim() || null,
        menu_services?.trim() || null,
        image_url?.trim() || null,
        galleryJson,
        featured,
      ]
    );
    const rowResult = await db.query(
      `SELECT b.id, b.name, b.slug, b.location, b.city, b.image_url,
              CASE WHEN COALESCE(b.featured, false) THEN 1 ELSE 0 END AS featured,
              c.slug AS category_slug
       FROM businesses b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.slug = $1`,
      [slug]
    );
    const row = rowResult.rows?.[0];
    // Notificación por correo a descubrepy.com.py@gmail.com (no bloquea la respuesta)
    sendNewBusinessNotification({
      name: name.trim(),
      slug,
      city: city.trim(),
      category_slug: slugTrim,
      location: location?.trim() || null,
      phone: phone?.trim() || null,
      instagram_url: instagram_url?.trim() || null,
      description: description?.trim() || null,
    }).catch((err) => console.error('[mail]', err));
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la empresa' });
  }
});

// Actualizar negocio (solo admin)
app.put('/api/businesses/:slug', requireAdmin, async (req, res) => {
  try {
    const slugParam = (req.params.slug || '').trim();
    if (!slugParam) return res.status(400).json({ error: 'Slug requerido' });
    const body = req.body || {};
    const {
      name,
      subcategory_slug,
      city,
      location,
      latitude,
      longitude,
      description,
      phone,
      opening_hours,
      menu_services,
      image_url,
      gallery_images,
    } = body;
    const featuredVal = body.featured === true || body.featured === 1 || body.featured === '1'
      ? true
      : (body.featured === false || body.featured === 0 || body.featured === '0' ? false : null);
    const categorySlugParam = body.category_slug ?? body.categorySlug;
    const existingResult = await db.query(
      'SELECT id, category_id FROM businesses WHERE LOWER(TRIM(slug)) = LOWER($1)',
      [slugParam]
    );
    const existing = existingResult.rows?.[0];
    if (!existing) return res.status(404).json({ error: 'Negocio no encontrado' });
    let category_id = existing.category_id;
    if (categorySlugParam?.trim()) {
      const catResult = await db.query('SELECT id FROM categories WHERE LOWER(TRIM(slug)) = LOWER($1)', [String(categorySlugParam).trim()]);
      const catRow = catResult.rows?.[0];
      if (catRow) category_id = catRow.id;
    }
    let subcategory_id = null;
    if (subcategory_slug?.trim()) {
      const subResult = await db.query(
        'SELECT id FROM subcategories WHERE category_id = $1 AND LOWER(TRIM(slug)) = LOWER($2)',
        [category_id, String(subcategory_slug).trim()]
      );
      const subRow = subResult.rows?.[0];
      if (subRow) subcategory_id = subRow.id;
    }
    let galleryVal = null;
    if (Array.isArray(gallery_images)) {
      galleryVal = gallery_images;
    } else if (typeof gallery_images === 'string' && gallery_images.trim()) {
      try {
        const parsed = JSON.parse(gallery_images);
        if (Array.isArray(parsed)) galleryVal = parsed;
      } catch {
        galleryVal = null;
      }
    }
    const galleryJson = galleryVal ? JSON.stringify(galleryVal) : null;
    const lat = latitude != null && latitude !== '' ? parseFloat(latitude) : null;
    const lng = longitude != null && longitude !== '' ? parseFloat(longitude) : null;
    const nameVal = name != null && String(name).trim() ? String(name).trim() : null;
    const cityVal = city != null && String(city).trim() ? String(city).trim() : null;
    const setParts = [];
    const updates = [];
    updates.push(category_id);
    setParts.push(`category_id = $${updates.length}`);
    updates.push(subcategory_id);
    setParts.push(`subcategory_id = $${updates.length}`);
    updates.push(nameVal);
    setParts.push(`name = COALESCE($${updates.length}, name)`);
    updates.push(location?.trim() || null);
    setParts.push(`location = $${updates.length}`);
    updates.push(cityVal);
    setParts.push(`city = COALESCE($${updates.length}, city)`);
    updates.push(Number.isFinite(lat) ? lat : null);
    setParts.push(`latitude = $${updates.length}`);
    updates.push(Number.isFinite(lng) ? lng : null);
    setParts.push(`longitude = $${updates.length}`);
    if (description !== undefined) {
      setParts.push(`description = $${updates.length + 1}`);
      updates.push(description != null ? String(description).trim() || null : null);
    }
    if (phone !== undefined) {
      setParts.push(`phone = $${updates.length + 1}`);
      updates.push(phone != null ? String(phone).trim() || null : null);
    }
    if (body.instagram_url !== undefined) {
      const instagram_url = body.instagram_url;
      setParts.push(`instagram_url = $${updates.length + 1}`);
      updates.push(instagram_url != null ? String(instagram_url).trim() || null : null);
    }
    // Siempre actualizar opening_hours si viene en el body (evita que no se guarde)
    if (Object.prototype.hasOwnProperty.call(body, 'opening_hours')) {
      const hoursVal = body.opening_hours;
      setParts.push(`opening_hours = $${updates.length + 1}`);
      updates.push(hoursVal != null && String(hoursVal).trim() !== '' ? String(hoursVal).trim() : null);
    }
    if (menu_services !== undefined) {
      setParts.push(`menu_services = $${updates.length + 1}`);
      updates.push(menu_services != null ? String(menu_services).trim() || null : null);
    }
    if (image_url !== undefined) {
      setParts.push(`image_url = $${updates.length + 1}`);
      updates.push(image_url != null ? String(image_url).trim() || null : null);
    }
    if (gallery_images !== undefined) {
      setParts.push(`gallery_images = $${updates.length + 1}::jsonb`);
      updates.push(galleryJson);
    }
    if (featuredVal !== null) {
      setParts.push(`featured = $${updates.length + 1}`);
      updates.push(featuredVal);
    }
    updates.push(existing.id);
    await db.query(
      `UPDATE businesses SET ${setParts.join(', ')} WHERE id = $${updates.length}`,
      updates
    );
    const rowResult = await db.query(
      `SELECT b.id, b.name, b.slug, b.location, b.city, b.image_url,
              CASE WHEN COALESCE(b.featured, false) THEN 1 ELSE 0 END AS featured,
              c.slug AS category_slug
       FROM businesses b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = $1`,
      [existing.id]
    );
    res.json(rowResult.rows?.[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
});

// Eliminar negocio (solo admin)
app.delete('/api/businesses/:slug', requireAdmin, async (req, res) => {
  try {
    const slugParam = (req.params.slug || '').trim();
    if (!slugParam) return res.status(400).json({ error: 'Slug requerido' });
    const result = await db.query('DELETE FROM businesses WHERE LOWER(TRIM(slug)) = LOWER($1)', [slugParam]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Negocio no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la empresa' });
  }
});

// --- Favoritos (solo usuarios logueados, no admin) ---
app.get('/api/favorites', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await db.query(
      `SELECT b.id, b.name, b.slug, b.location, b.city, b.rating, b.image_url, b.featured, c.title AS category, c.slug AS category_slug
       FROM user_favorites uf
       INNER JOIN businesses b ON uf.business_id = b.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    const rawRows = result && Array.isArray(result.rows) ? result.rows : [];
    const rows = rawRows.map((r) => ({ ...r, featured: r.featured ? 1 : 0 }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

app.post('/api/favorites', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const slug = (req.body?.slug || req.body?.business_slug || '').trim();
    if (!slug) return res.status(400).json({ error: 'Falta el slug del negocio' });
    const bizResult = await db.query('SELECT id FROM businesses WHERE LOWER(TRIM(slug)) = LOWER($1)', [slug]);
    const biz = bizResult.rows?.[0];
    if (!biz) return res.status(404).json({ error: 'Negocio no encontrado' });
    await db.query(
      'INSERT INTO user_favorites (user_id, business_id) VALUES ($1, $2) ON CONFLICT (user_id, business_id) DO NOTHING',
      [userId, biz.id]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

app.delete('/api/favorites/:slug', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const slug = (req.params.slug || '').trim();
    if (!slug) return res.status(400).json({ error: 'Slug requerido' });
    const bizResult = await db.query('SELECT id FROM businesses WHERE LOWER(TRIM(slug)) = LOWER($1)', [slug]);
    const biz = bizResult.rows?.[0];
    if (!biz) return res.status(404).json({ error: 'Negocio no encontrado' });
    const result = await db.query('DELETE FROM user_favorites WHERE user_id = $1 AND business_id = $2', [userId, biz.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'No estaba en favoritos' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al quitar favorito' });
  }
});

app.get('/api/favorites/check/:slug', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const slug = (req.params.slug || '').trim();
    if (!slug) return res.json({ isFavorite: false });
    const result = await db.query(
      `SELECT 1 FROM user_favorites uf
       INNER JOIN businesses b ON uf.business_id = b.id
       WHERE uf.user_id = $1 AND LOWER(TRIM(b.slug)) = LOWER($2)
       LIMIT 1`,
      [userId, slug]
    );
    const rows = result && Array.isArray(result.rows) ? result.rows : [];
    res.json({ isFavorite: !!rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ isFavorite: false });
  }
});

// Subir imagen (solo admin) — el navegador llama a /api/upload (proxy al backend)
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Se requiere un archivo de imagen' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Stats para el hero (opcional)
app.get('/api/stats', async (req, res) => {
  try {
    const businessCountResult = await db.query('SELECT COUNT(*)::int AS total FROM businesses');
    const businessCount = businessCountResult.rows?.[0];
    res.json({
      businessCount: businessCount?.total ?? 0,
      monthlyVisitors: 15000,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Prueba de envío de correo (para depurar: abrir http://localhost:6000/api/test-email)
app.get('/api/test-email', async (_req, res) => {
  try {
    await sendTestEmail();
    res.json({ ok: true, message: 'Correo de prueba enviado a descubrepy.com.py@gmail.com' });
  } catch (err) {
    console.error('[test-email]', err.message, err.response || '');
    res.status(500).json({ ok: false, error: err.message, detail: err.response || null });
  }
});

// Formulario de contacto (Solicitá tu publicación) → envía email a descubrepy.com.py@gmail.com
app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body || {};
    const nombre = (body.nombre || '').trim();
    const email = (body.email || '').trim();
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }
    const emailConfigured = process.env.EMAIL_USER && (process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, '').trim();
    if (!emailConfigured) {
      console.warn('[contact] EMAIL_USER o EMAIL_APP_PASSWORD no configurados en .env');
      return res.status(503).json({
        error: 'El envío de solicitudes no está disponible en este momento. Por favor contactanos por WhatsApp o por otro medio.',
      });
    }
    await sendContactNotification({
      nombre,
      telefono: (body.telefono || '').trim(),
      email,
      negocio: (body.negocio || '').trim(),
      categoria: (body.categoria || '').trim(),
      ciudad: (body.ciudad || '').trim(),
      mensaje: (body.mensaje || '').trim(),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(500).json({ error: err.message || 'Error al enviar la solicitud' });
  }
});

// --- Auth: Registro ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Faltan nombre, email o contraseña' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const emailNorm = email.trim().toLowerCase();
    const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [emailNorm]);
    const existing = existingResult.rows?.[0];
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const insertResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), emailNorm, password_hash, 'user']
    );
    const row = insertResult.rows?.[0];
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken({ id: row.id, email: row.email });
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

// --- Auth: Iniciar sesión ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
    const result = await db.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    const row = result.rows?.[0];
    if (!row) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken({ id: row.id, email: row.email });
    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// --- Auth: Usuario actual (opcional) ---
app.get('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Token inválido o expirado' });
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.id]);
    const row = result.rows?.[0];
    if (!row) return res.status(401).json({ error: 'Usuario no encontrado' });
    return res.json({ user: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al verificar sesión' });
  }
});

// --- Auth: Actualizar perfil (nombre y/o contraseña) ---
app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, current_password, new_password } = req.body || {};
    const updates = [];
    const params = [];

    if (name != null && String(name).trim()) {
      params.push(String(name).trim());
      updates.push(`name = $${params.length}`);
    }

    if (new_password != null && String(new_password).length > 0) {
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      if (!current_password || String(current_password).length === 0) {
        return res.status(400).json({ error: 'Ingresá tu contraseña actual para cambiar la contraseña' });
      }
      const pwdResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      const row = pwdResult.rows?.[0];
      if (!row) return res.status(401).json({ error: 'Usuario no encontrado' });
      const ok = await bcrypt.compare(String(current_password), row.password_hash);
      if (!ok) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      const password_hash = await bcrypt.hash(String(new_password), 10);
      params.push(password_hash);
      updates.push(`password_hash = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Enviá name y/o new_password con current_password' });
    }

    params.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    const userResult = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
    return res.json({ user: userResult.rows?.[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// --- Admin: Listar clientes (solo usuarios con role 'user') ---
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = $1 ORDER BY name ASC',
      ['user']
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
});

// --- Admin: Actualizar cliente ---
app.put('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' });
    const { name, email, new_password } = req.body || {};
    const updates = [];
    const params = [];
    if (name != null && String(name).trim()) {
      params.push(String(name).trim());
      updates.push(`name = $${params.length}`);
    }
    if (email != null && String(email).trim()) {
      const emailNorm = String(email).trim().toLowerCase();
      const existingResult = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [emailNorm, id]);
      const existing = existingResult.rows?.[0];
      if (existing) return res.status(400).json({ error: 'Ese email ya está en uso' });
      params.push(emailNorm);
      updates.push(`email = $${params.length}`);
    }
    if (new_password != null && String(new_password).length > 0) {
      if (new_password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      params.push(await bcrypt.hash(String(new_password), 10));
      updates.push(`password_hash = $${params.length}`);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Enviá name, email o new_password' });
    params.push(id);
    params.push('user');
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length - 1} AND role = $${params.length}`,
      params
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    const userResult = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    res.json(userResult.rows?.[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// --- Admin: Eliminar cliente ---
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' });
    const result = await db.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'user']);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend DescubrePY en http://localhost:${PORT}`);
  const emailOk = process.env.EMAIL_USER && (process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, '').trim();
  console.log(`Email (notificaciones): ${emailOk ? 'configurado → descubrepy.com.py@gmail.com' : 'NO configurado (revisá .env)'}`);
});
