/**
 * Rutas admin de pagos mensuales.
 * registerPaymentRoutes(app, { db, requireAdmin })
 */
function registerPaymentRoutes(app, { db, requireAdmin }) {
  const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const VALID_STATUS = new Set(['pagado', 'pendiente', 'vencido', 'no_corresponde'])
  const VALID_METHODS = new Set(['transferencia', 'efectivo', 'qr', 'tarjeta', 'otro'])

  async function ensurePaymentsSchema() {
    await db.query(`
      ALTER TABLE businesses
      ADD COLUMN IF NOT EXISTS monthly_amount INTEGER NOT NULL DEFAULT 0
    `)
    await db.query(`
      ALTER TABLE businesses
      ADD COLUMN IF NOT EXISTS plan VARCHAR(80) NOT NULL DEFAULT 'Estándar'
    `)
    await db.query(`UPDATE businesses SET monthly_amount = 0 WHERE monthly_amount IS NULL`)
    await db.query(`UPDATE businesses SET plan = 'Estándar' WHERE plan IS NULL OR TRIM(plan) = ''`)

    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        amount INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'pendiente',
        payment_date DATE,
        payment_method VARCHAR(64),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uk_payment_business_year_month UNIQUE (business_id, year, month),
        CONSTRAINT fk_payment_business
          FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
      )
    `)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_payments_business ON payments (business_id)`)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_payments_year_month ON payments (year, month)`)

    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        admin_user_id INTEGER,
        admin_name VARCHAR(160),
        action VARCHAR(80) NOT NULL,
        details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ph_business
          FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
      )
    `)
    await db.query(`CREATE INDEX IF NOT EXISTS idx_payment_history_business ON payment_history (business_id)`)
  }

  ensurePaymentsSchema().catch((err) => {
    console.error('[schema] Error al preparar pagos:', err.message)
  })

  async function logHistory(businessId, adminUser, action, details) {
    await db.query(
      `INSERT INTO payment_history (business_id, admin_user_id, admin_name, action, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        businessId,
        adminUser?.id ?? null,
        adminUser?.name ?? null,
        action,
        details ?? null,
      ]
    )
  }

  async function getAdminUser(req) {
    const id = req.userId
    if (!id) return null
    const r = await db.query('SELECT id, name, email FROM users WHERE id = $1', [id])
    return r.rows?.[0] || null
  }

  function paraguayNowParts() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Asuncion',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date())
    const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0)
    return { year: get('year'), month: get('month'), day: get('day') }
  }

  /** Estado efectivo para UI/stats */
  function effectiveStatus(stored, year, month, now) {
    const s = String(stored || 'pendiente').toLowerCase()
    if (s === 'pagado' || s === 'no_corresponde' || s === 'vencido') return s
    // pendiente: si el mes ya pasó → vencido
    if (year < now.year || (year === now.year && month < now.month)) return 'vencido'
    return 'pendiente'
  }

  // GET /api/admin/payments?year=2027
  app.get('/api/admin/payments', requireAdmin, async (req, res) => {
    try {
      const now = paraguayNowParts()
      const year = Math.max(2000, Math.min(2100, parseInt(String(req.query.year || now.year), 10) || now.year))

      const bizResult = await db.query(
        `SELECT b.id, b.name, b.slug, b.city, b.featured,
                COALESCE(b.monthly_amount, 0)::int AS monthly_amount,
                COALESCE(NULLIF(TRIM(b.plan), ''), 'Estándar') AS plan,
                b.created_at,
                c.title AS category, c.slug AS category_slug
         FROM businesses b
         LEFT JOIN categories c ON b.category_id = c.id
         ORDER BY b.name ASC`
      )

      const payResult = await db.query(
        `SELECT id, business_id, year, month, amount, status, payment_date, payment_method, notes
         FROM payments
         WHERE year = $1`,
        [year]
      )

      const byBusiness = new Map()
      for (const p of payResult.rows || []) {
        const key = p.business_id
        if (!byBusiness.has(key)) byBusiness.set(key, {})
        byBusiness.get(key)[p.month] = p
      }

      let paidThisMonth = 0
      let pendingCount = 0
      let overdueCount = 0
      let expectedIncome = 0
      let receivedIncome = 0

      const businesses = (bizResult.rows || []).map((b) => {
        const monthsMap = byBusiness.get(b.id) || {}
        const months = MONTHS.map((m) => {
          const row = monthsMap[m]
          const stored = row?.status || 'pendiente'
          const status = effectiveStatus(stored, year, m, now)
          const amount = row?.amount != null ? Number(row.amount) : Number(b.monthly_amount || 0)
          return {
            month: m,
            status,
            stored_status: stored,
            amount,
            payment_date: row?.payment_date || null,
            payment_method: row?.payment_method || null,
            notes: row?.notes || null,
            id: row?.id || null,
          }
        })

        const refMonth = year === now.year ? now.month : 12
        const focus = months.find((x) => x.month === refMonth) || months[months.length - 1]
        if (focus.status === 'pagado') paidThisMonth += 1
        if (focus.status === 'pendiente') pendingCount += 1
        if (focus.status === 'vencido') overdueCount += 1

        const monthly = Number(b.monthly_amount || 0)
        if (focus.status !== 'no_corresponde') {
          expectedIncome += monthly
        }
        if (focus.status === 'pagado') {
          receivedIncome += Number(focus.amount || monthly)
        }

        return {
          ...b,
          featured: b.featured ? 1 : 0,
          months,
        }
      })

      const missingIncome = Math.max(0, expectedIncome - receivedIncome)

      res.json({
        year,
        now,
        stats: {
          total_businesses: businesses.length,
          paid_this_month: paidThisMonth,
          pending: pendingCount,
          overdue: overdueCount,
          expected_income: expectedIncome,
          received_income: receivedIncome,
          missing_income: missingIncome,
        },
        businesses,
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener pagos' })
    }
  })

  // PUT /api/admin/payments/business/:id/amount  { monthly_amount, plan? }
  app.put('/api/admin/payments/business/:id/amount', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' })
      const amount = Math.max(0, Math.round(Number(req.body?.monthly_amount)))
      if (!Number.isFinite(amount)) return res.status(400).json({ error: 'Monto inválido' })
      const plan =
        req.body?.plan != null && String(req.body.plan).trim()
          ? String(req.body.plan).trim().slice(0, 80)
          : null

      const prev = await db.query(
        'SELECT id, name, monthly_amount, plan FROM businesses WHERE id = $1',
        [id]
      )
      const biz = prev.rows?.[0]
      if (!biz) return res.status(404).json({ error: 'Negocio no encontrado' })

      if (plan) {
        await db.query('UPDATE businesses SET monthly_amount = $1, plan = $2 WHERE id = $3', [
          amount,
          plan,
          id,
        ])
      } else {
        await db.query('UPDATE businesses SET monthly_amount = $1 WHERE id = $2', [amount, id])
      }

      const admin = await getAdminUser(req)
      const details = [
        `Monto: ${Number(biz.monthly_amount || 0).toLocaleString('es-PY')} → ${amount.toLocaleString('es-PY')} Gs`,
      ]
      if (plan && plan !== biz.plan) details.push(`Plan: ${biz.plan || 'Estándar'} → ${plan}`)
      await logHistory(id, admin, 'Monto / plan actualizado', details.join(' · '))

      const updated = await db.query(
        `SELECT id, name, COALESCE(monthly_amount,0)::int AS monthly_amount,
                COALESCE(NULLIF(TRIM(plan), ''), 'Estándar') AS plan
         FROM businesses WHERE id = $1`,
        [id]
      )
      res.json(updated.rows[0])
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al actualizar monto' })
    }
  })

  // PUT /api/admin/payments/month  { business_id, year, month, amount, status, payment_date, payment_method, notes }
  app.put('/api/admin/payments/month', requireAdmin, async (req, res) => {
    try {
      const body = req.body || {}
      const businessId = parseInt(body.business_id, 10)
      const year = parseInt(body.year, 10)
      const month = parseInt(body.month, 10)
      if (!Number.isFinite(businessId) || !Number.isFinite(year) || !Number.isFinite(month)) {
        return res.status(400).json({ error: 'business_id, year y month son obligatorios' })
      }
      if (month < 1 || month > 12) return res.status(400).json({ error: 'Mes inválido' })

      const status = String(body.status || 'pendiente').toLowerCase()
      if (!VALID_STATUS.has(status)) return res.status(400).json({ error: 'Estado inválido' })

      let method = body.payment_method != null ? String(body.payment_method).trim().toLowerCase() : null
      if (method && !VALID_METHODS.has(method)) method = 'otro'

      const amount = Math.max(0, Math.round(Number(body.amount ?? 0)))
      const paymentDate = body.payment_date ? String(body.payment_date).slice(0, 10) : null
      const notes = body.notes != null ? String(body.notes).trim().slice(0, 2000) : null

      const bizCheck = await db.query('SELECT id, monthly_amount FROM businesses WHERE id = $1', [
        businessId,
      ])
      if (!bizCheck.rows?.[0]) return res.status(404).json({ error: 'Negocio no encontrado' })

      const finalAmount =
        Number.isFinite(amount) && amount >= 0
          ? amount
          : Number(bizCheck.rows[0].monthly_amount || 0)

      const result = await db.query(
        `INSERT INTO payments (business_id, year, month, amount, status, payment_date, payment_method, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (business_id, year, month) DO UPDATE SET
           amount = EXCLUDED.amount,
           status = EXCLUDED.status,
           payment_date = EXCLUDED.payment_date,
           payment_method = EXCLUDED.payment_method,
           notes = EXCLUDED.notes,
           updated_at = NOW()
         RETURNING *`,
        [businessId, year, month, finalAmount, status, paymentDate, method, notes]
      )

      const admin = await getAdminUser(req)
      await logHistory(
        businessId,
        admin,
        'Mes actualizado',
        `${year}-${String(month).padStart(2, '0')}: ${status}${method ? ` · ${method}` : ''}${
          paymentDate ? ` · ${paymentDate}` : ''
        } · ${finalAmount.toLocaleString('es-PY')} Gs`
      )

      res.json(result.rows[0])
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al guardar pago del mes' })
    }
  })

  // POST /api/admin/payments/mark-paid  { business_id, year, month? }
  app.post('/api/admin/payments/mark-paid', requireAdmin, async (req, res) => {
    try {
      const now = paraguayNowParts()
      const businessId = parseInt(req.body?.business_id, 10)
      const year = parseInt(req.body?.year ?? now.year, 10)
      const month = parseInt(req.body?.month ?? now.month, 10)
      if (!Number.isFinite(businessId)) return res.status(400).json({ error: 'business_id requerido' })

      const biz = await db.query('SELECT id, monthly_amount FROM businesses WHERE id = $1', [
        businessId,
      ])
      if (!biz.rows?.[0]) return res.status(404).json({ error: 'Negocio no encontrado' })
      const amount = Number(biz.rows[0].monthly_amount || 0)
      const today = `${now.year}-${String(now.month).padStart(2, '0')}-${String(now.day).padStart(2, '0')}`

      const result = await db.query(
        `INSERT INTO payments (business_id, year, month, amount, status, payment_date, payment_method, updated_at)
         VALUES ($1, $2, $3, $4, 'pagado', $5, 'transferencia', NOW())
         ON CONFLICT (business_id, year, month) DO UPDATE SET
           status = 'pagado',
           amount = COALESCE(NULLIF(payments.amount, 0), EXCLUDED.amount),
           payment_date = COALESCE(payments.payment_date, EXCLUDED.payment_date),
           updated_at = NOW()
         RETURNING *`,
        [businessId, year, month, amount, today]
      )

      const admin = await getAdminUser(req)
      await logHistory(
        businessId,
        admin,
        'Marcado como pagado',
        `${year}-${String(month).padStart(2, '0')}`
      )

      res.json(result.rows[0])
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al marcar como pagado' })
    }
  })

  // GET /api/admin/payments/business/:id/history
  app.get('/api/admin/payments/business/:id/history', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' })
      const result = await db.query(
        `SELECT id, business_id, admin_user_id, admin_name, action, details, created_at
         FROM payment_history
         WHERE business_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [id]
      )
      res.json(result.rows)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener historial' })
    }
  })
}

module.exports = { registerPaymentRoutes }
