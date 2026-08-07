/**
 * Analytics / Estadísticas de negocios.
 * registerAnalyticsRoutes(app, { db, requireAdmin })
 */
function registerAnalyticsRoutes(app, { db, requireAdmin }) {
  const EVENT_TYPES = new Set([
    'profile_view',
    'whatsapp_click',
    'phone_click',
    'instagram_click',
    'share_click',
    'coupon_claim',
    'coupon_used',
  ])

  const VIEW_DEDUPE_MINUTES = 30

  async function ensureAnalyticsSchema() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_events (
        id BIGSERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        event_type VARCHAR(40) NOT NULL,
        session_id VARCHAR(64),
        user_ip VARCHAR(64),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_be_business
          FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
      )
    `)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_be_business ON business_events (business_id)`)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_be_type ON business_events (event_type)`)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_be_created ON business_events (created_at DESC)`)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_be_business_type_created ON business_events (business_id, event_type, created_at DESC)`
    )
  }

  ensureAnalyticsSchema().catch((err) => {
    console.error('[schema] Error al preparar business_events:', err.message)
  })

  function clientIp(req) {
    const xf = req.headers['x-forwarded-for']
    if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim().slice(0, 64)
    return (req.socket?.remoteAddress || '').slice(0, 64) || null
  }

  function parsePeriod(query) {
    const period = String(query.period || '30d')
    const now = new Date()
    let from = new Date(now)
    let to = new Date(now)

    if (period === 'today') {
      from.setHours(0, 0, 0, 0)
    } else if (period === '7d') {
      from.setDate(from.getDate() - 7)
    } else if (period === '30d') {
      from.setDate(from.getDate() - 30)
    } else if (period === '90d') {
      from.setDate(from.getDate() - 90)
    } else if (period === 'year') {
      from = new Date(now.getFullYear(), 0, 1)
    } else if (period === 'custom') {
      const fromStr = String(query.from || '').slice(0, 10)
      const toStr = String(query.to || '').slice(0, 10)
      if (fromStr) from = new Date(`${fromStr}T00:00:00`)
      if (toStr) to = new Date(`${toStr}T23:59:59`)
      else from.setDate(from.getDate() - 30)
    } else {
      from.setDate(from.getDate() - 30)
    }

    if (Number.isNaN(from.getTime())) {
      from = new Date()
      from.setDate(from.getDate() - 30)
    }
    if (Number.isNaN(to.getTime())) to = new Date()
    return { period, from, to }
  }

  // POST /api/analytics/event  { business_id | slug, event_type, session_id }
  app.post('/api/analytics/event', async (req, res) => {
    try {
      const body = req.body || {}
      const eventType = String(body.event_type || '').trim()
      if (!EVENT_TYPES.has(eventType)) {
        return res.status(400).json({ error: 'event_type inválido' })
      }

      let businessId = parseInt(body.business_id, 10)
      if (!Number.isFinite(businessId) && body.slug) {
        const r = await db.query(
          'SELECT id FROM businesses WHERE LOWER(TRIM(slug)) = LOWER($1) LIMIT 1',
          [String(body.slug).trim()]
        )
        businessId = r.rows?.[0]?.id
      }
      if (!Number.isFinite(businessId)) {
        return res.status(400).json({ error: 'business_id o slug requerido' })
      }

      const exists = await db.query('SELECT id FROM businesses WHERE id = $1', [businessId])
      if (!exists.rows?.[0]) return res.status(404).json({ error: 'Negocio no encontrado' })

      const sessionId = body.session_id != null ? String(body.session_id).trim().slice(0, 64) : null
      const ip = clientIp(req)

      // Dedupe visitas: misma sesión + mismo negocio en 30 minutos
      if (eventType === 'profile_view' && sessionId) {
        const dup = await db.query(
          `SELECT id FROM business_events
           WHERE business_id = $1
             AND event_type = 'profile_view'
             AND session_id = $2
             AND created_at > NOW() - ($3::text || ' minutes')::interval
           LIMIT 1`,
          [businessId, sessionId, String(VIEW_DEDUPE_MINUTES)]
        )
        if (dup.rows?.length) {
          return res.json({ ok: true, deduped: true })
        }
      }

      await db.query(
        `INSERT INTO business_events (business_id, event_type, session_id, user_ip)
         VALUES ($1, $2, $3, $4)`,
        [businessId, eventType, sessionId || null, ip]
      )
      res.status(201).json({ ok: true, deduped: false })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al registrar evento' })
    }
  })

  // GET /api/admin/analytics/summary?period=&from=&to=
  app.get('/api/admin/analytics/summary', requireAdmin, async (req, res) => {
    try {
      const { from, to, period } = parsePeriod(req.query || {})

      const [bizStats, eventStats] = await Promise.all([
        db.query(`
          SELECT
            COUNT(*)::int AS total_businesses,
            COUNT(*) FILTER (WHERE COALESCE(featured, false) = true)::int AS featured_businesses,
            COUNT(*) FILTER (WHERE COALESCE(discount_percent, 0) > 0)::int AS discount_businesses
          FROM businesses
        `),
        db.query(
          `
          SELECT
            COUNT(*) FILTER (WHERE event_type = 'profile_view')::int AS profile_views,
            COUNT(*) FILTER (WHERE event_type = 'coupon_claim')::int AS coupon_claims,
            COUNT(*) FILTER (WHERE event_type = 'coupon_used')::int AS coupon_used,
            COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp_clicks,
            COUNT(*) FILTER (WHERE event_type = 'phone_click')::int AS phone_clicks,
            COUNT(*) FILTER (WHERE event_type = 'instagram_click')::int AS instagram_clicks,
            COUNT(*) FILTER (WHERE event_type = 'share_click')::int AS share_clicks
          FROM business_events
          WHERE created_at >= $1 AND created_at <= $2
        `,
          [from, to]
        ),
      ])

      res.json({
        period,
        from: from.toISOString(),
        to: to.toISOString(),
        ...(bizStats.rows?.[0] || {}),
        ...(eventStats.rows?.[0] || {}),
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener resumen' })
    }
  })

  // GET /api/admin/analytics/businesses?period=&sort=
  app.get('/api/admin/analytics/businesses', requireAdmin, async (req, res) => {
    try {
      const { from, to, period } = parsePeriod(req.query || {})
      const sort = String(req.query.sort || 'views')

      const result = await db.query(
        `
        SELECT
          b.id, b.name, b.slug, b.city, b.image_url, b.featured, b.opening_hours,
          COALESCE(b.discount_percent, 0)::int AS discount_percent,
          COALESCE(b.monthly_amount, 0)::int AS monthly_amount,
          COALESCE(NULLIF(TRIM(b.plan), ''), 'Estándar') AS plan,
          b.created_at,
          c.title AS category, c.slug AS category_slug,
          COALESCE(e.profile_views, 0)::int AS profile_views,
          COALESCE(e.whatsapp_clicks, 0)::int AS whatsapp_clicks,
          COALESCE(e.phone_clicks, 0)::int AS phone_clicks,
          COALESCE(e.instagram_clicks, 0)::int AS instagram_clicks,
          COALESCE(e.share_clicks, 0)::int AS share_clicks,
          COALESCE(e.coupon_claims, 0)::int AS coupon_claims,
          COALESCE(e.coupon_used, 0)::int AS coupon_used
        FROM businesses b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN (
          SELECT
            business_id,
            COUNT(*) FILTER (WHERE event_type = 'profile_view') AS profile_views,
            COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
            COUNT(*) FILTER (WHERE event_type = 'phone_click') AS phone_clicks,
            COUNT(*) FILTER (WHERE event_type = 'instagram_click') AS instagram_clicks,
            COUNT(*) FILTER (WHERE event_type = 'share_click') AS share_clicks,
            COUNT(*) FILTER (WHERE event_type = 'coupon_claim') AS coupon_claims,
            COUNT(*) FILTER (WHERE event_type = 'coupon_used') AS coupon_used
          FROM business_events
          WHERE created_at >= $1 AND created_at <= $2
          GROUP BY business_id
        ) e ON e.business_id = b.id
        `,
        [from, to]
      )

      const sortKey =
        {
          views: 'profile_views',
          coupons: 'coupon_claims',
          whatsapp: 'whatsapp_clicks',
          instagram: 'instagram_clicks',
          shares: 'share_clicks',
          phone: 'phone_clicks',
          used: 'coupon_used',
        }[sort] || 'profile_views'

      const rows = (result.rows || []).map((r) => {
        const claims = Number(r.coupon_claims || 0)
        const used = Number(r.coupon_used || 0)
        const conversion = claims > 0 ? Math.round((used / claims) * 1000) / 10 : 0
        return {
          ...r,
          featured: r.featured ? 1 : 0,
          conversion_rate: conversion,
        }
      })

      rows.sort((a, b) => {
        const diff = Number(b[sortKey] || 0) - Number(a[sortKey] || 0)
        if (diff !== 0) return diff
        return String(a.name).localeCompare(String(b.name))
      })

      res.json({ period, from: from.toISOString(), to: to.toISOString(), businesses: rows })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al listar estadísticas de negocios' })
    }
  })

  // GET /api/admin/analytics/tops?period=
  app.get('/api/admin/analytics/tops', requireAdmin, async (req, res) => {
    try {
      const { from, to, period } = parsePeriod(req.query || {})

      async function top(eventType) {
        const r = await db.query(
          `
          SELECT b.id, b.name, b.slug, b.image_url, COUNT(e.id)::int AS count
          FROM business_events e
          INNER JOIN businesses b ON b.id = e.business_id
          WHERE e.event_type = $1 AND e.created_at >= $2 AND e.created_at <= $3
          GROUP BY b.id, b.name, b.slug, b.image_url
          ORDER BY count DESC, b.name ASC
          LIMIT 10
          `,
          [eventType, from, to]
        )
        return r.rows || []
      }

      const [views, whatsapp, claims, used, shares, instagram] = await Promise.all([
        top('profile_view'),
        top('whatsapp_click'),
        top('coupon_claim'),
        top('coupon_used'),
        top('share_click'),
        top('instagram_click'),
      ])

      res.json({
        period,
        from: from.toISOString(),
        to: to.toISOString(),
        tops: {
          most_viewed: views,
          most_whatsapp: whatsapp,
          most_coupon_claims: claims,
          most_coupon_used: used,
          most_shared: shares,
          most_instagram: instagram,
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener tops' })
    }
  })

  // GET /api/admin/analytics/business/:slug?period=
  app.get('/api/admin/analytics/business/:slug', requireAdmin, async (req, res) => {
    try {
      const slug = String(req.params.slug || '').trim()
      if (!slug) return res.status(400).json({ error: 'Slug requerido' })
      const { from, to, period } = parsePeriod(req.query || {})

      const bizResult = await db.query(
        `
        SELECT b.id, b.name, b.slug, b.city, b.image_url, b.featured,
               COALESCE(b.discount_percent, 0)::int AS discount_percent,
               COALESCE(b.monthly_amount, 0)::int AS monthly_amount,
               COALESCE(NULLIF(TRIM(b.plan), ''), 'Estándar') AS plan,
               b.created_at,
               c.title AS category, c.slug AS category_slug
        FROM businesses b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE LOWER(TRIM(b.slug)) = LOWER($1)
        LIMIT 1
        `,
        [slug]
      )
      const business = bizResult.rows?.[0]
      if (!business) return res.status(404).json({ error: 'Negocio no encontrado' })

      const totals = await db.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE event_type = 'profile_view')::int AS profile_views,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp_clicks,
          COUNT(*) FILTER (WHERE event_type = 'phone_click')::int AS phone_clicks,
          COUNT(*) FILTER (WHERE event_type = 'instagram_click')::int AS instagram_clicks,
          COUNT(*) FILTER (WHERE event_type = 'share_click')::int AS share_clicks,
          COUNT(*) FILTER (WHERE event_type = 'coupon_claim')::int AS coupon_claims,
          COUNT(*) FILTER (WHERE event_type = 'coupon_used')::int AS coupon_used
        FROM business_events
        WHERE business_id = $1 AND created_at >= $2 AND created_at <= $3
        `,
        [business.id, from, to]
      )

      const monthly = await db.query(
        `
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
          COUNT(*) FILTER (WHERE event_type = 'profile_view')::int AS profile_views,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS whatsapp_clicks,
          COUNT(*) FILTER (WHERE event_type = 'phone_click')::int AS phone_clicks,
          COUNT(*) FILTER (WHERE event_type = 'instagram_click')::int AS instagram_clicks,
          COUNT(*) FILTER (WHERE event_type = 'share_click')::int AS share_clicks,
          COUNT(*) FILTER (WHERE event_type = 'coupon_claim')::int AS coupon_claims,
          COUNT(*) FILTER (WHERE event_type = 'coupon_used')::int AS coupon_used
        FROM business_events
        WHERE business_id = $1 AND created_at >= $2 AND created_at <= $3
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at) ASC
        `,
        [business.id, from, to]
      )

      const t = totals.rows?.[0] || {}
      const claims = Number(t.coupon_claims || 0)
      const used = Number(t.coupon_used || 0)

      res.json({
        period,
        from: from.toISOString(),
        to: to.toISOString(),
        business: {
          ...business,
          featured: business.featured ? 1 : 0,
        },
        totals: {
          ...t,
          conversion_rate: claims > 0 ? Math.round((used / claims) * 1000) / 10 : 0,
        },
        monthly: monthly.rows || [],
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener detalle de estadísticas' })
    }
  })
}

module.exports = { registerAnalyticsRoutes }
