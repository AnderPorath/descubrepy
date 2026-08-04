// Base URL del backend. En producción: NEXT_PUBLIC_API_URL (ej. https://tu-api.onrender.com). En local: vacío en navegador (/api) o 127.0.0.1:6000 en servidor.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window === 'undefined' ? 'http://127.0.0.1:6000' : '');
const FETCH_OPTIONS = { next: { revalidate: 30 } as const };

/** Convierte image_url a URL absoluta para que las fotos carguen desde el backend (necesario cuando front y backend están en distintos dominios). */
export function getImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads/')) {
    const base = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL ?? '') : (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:6000');
    return base ? `${base.replace(/\/$/, '')}${u}` : u;
  }
  return u;
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, FETCH_OPTIONS);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export type CategoryApi = { id: number; slug: string; title: string; description: string | null; icon_name: string; business_count: number }

export type SubcategoryApi = { id: number; slug: string; title: string; sort_order: number; business_count?: number }
const MERGED_CATEGORY_PARENT = "gastronomia"
const MERGED_CATEGORY_CHILD = "cafeterias"

function normalizeCategories(categories: CategoryApi[]): CategoryApi[] {
  if (!Array.isArray(categories) || categories.length === 0) return []
  const parent = categories.find((c) => c.slug === MERGED_CATEGORY_PARENT)
  const child = categories.find((c) => c.slug === MERGED_CATEGORY_CHILD)
  const filtered = categories.filter((c) => c.slug !== MERGED_CATEGORY_CHILD)
  if (!parent || !child) return filtered
  return filtered.map((cat) =>
    cat.slug === MERGED_CATEGORY_PARENT
      ? { ...cat, business_count: Number(cat.business_count || 0) + Number(child.business_count || 0) }
      : cat
  )
}

function normalizeSubcategoryTitle(sub: SubcategoryApi): SubcategoryApi {
  if (sub.slug === "comida-internacional") {
    return { ...sub, title: "Heladerías" }
  }
  if (sub.slug === "cafe-especialidad") {
    return { ...sub, title: "Cafeterias" }
  }
  return sub
}

function isVisibleSubcategory(sub: SubcategoryApi): boolean {
  return sub.slug !== "confiterias"
}

/** Categorías sin caché para que el business_count se actualice al eliminar/crear negocios. */
export async function fetchCategories(): Promise<CategoryApi[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return []
    return normalizeCategories(data as CategoryApi[])
  } catch {
    return [];
  }
}

/** Alias por compatibilidad (registro de empresa, etc.). */
export async function fetchCategoriesFresh(): Promise<CategoryApi[]> {
  return fetchCategories();
}

export async function fetchSubcategories(categorySlug: string): Promise<SubcategoryApi[]> {
  if (!categorySlug?.trim()) return []
  try {
    const normalizedCategory = categorySlug.trim().toLowerCase()
    const categoriesToFetch =
      normalizedCategory === MERGED_CATEGORY_PARENT
        ? [MERGED_CATEGORY_PARENT, MERGED_CATEGORY_CHILD]
        : [normalizedCategory]
    const responses = await Promise.all(
      categoriesToFetch.map((slug) =>
        fetch(`${API_URL}/api/subcategories?category=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      )
    )
    const chunks = await Promise.all(
      responses.map(async (res) => {
        if (!res.ok) return []
        const data = await res.json()
        return Array.isArray(data) ? data : []
      })
    )
    const merged = chunks
      .flat()
      .map((sub) => normalizeSubcategoryTitle(sub as SubcategoryApi))
      .filter((sub) => isVisibleSubcategory(sub))
    const bySlug = new Map<string, SubcategoryApi>()
    for (const sub of merged) {
      const existing = bySlug.get(sub.slug)
      if (!existing) {
        bySlug.set(sub.slug, sub)
      } else {
        bySlug.set(sub.slug, {
          ...existing,
          business_count: Number(existing.business_count || 0) + Number(sub.business_count || 0),
        })
      }
    }
    return [...bySlug.values()].sort((a, b) => {
      const orderA = Number.isFinite(a.sort_order) ? a.sort_order : 999
      const orderB = Number.isFinite(b.sort_order) ? b.sort_order : 999
      if (orderA !== orderB) return orderA - orderB
      return String(a.title).localeCompare(String(b.title))
    })
  } catch {
    return []
  }
}

export async function fetchFeatured() {
  return safeFetch<BusinessApi[]>(`${API_URL}/api/featured`, []);
}

/** Destacados con filtros (ciudad, categoría, subcategoría) */
export type FeaturedFilters = {
  city?: string
  /** Si no hay ciudad concreta: distritos del departamento (se envían como cities= en la API) */
  cities?: string[]
  category?: string
  subcategory?: string
  q?: string
}
export type DiscountFilters = FeaturedFilters

export async function fetchFeaturedFiltered(filters?: FeaturedFilters): Promise<BusinessApi[]> {
  const params = new URLSearchParams()
  if (filters?.city?.trim()) {
    params.set('city', filters.city.trim())
  } else if (filters?.cities && filters.cities.length > 0) {
    params.set('cities', filters.cities.map((c) => c.trim()).filter(Boolean).join('|'))
  }
  if (filters?.category?.trim()) params.set('category', filters.category.trim())
  if (filters?.subcategory?.trim()) params.set('subcategory', filters.subcategory.trim())
  if (filters?.q?.trim()) params.set('q', filters.q.trim())
  const query = params.toString()
  const url = `${API_URL}/api/featured${query ? `?${query}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function fetchDiscounts(filters?: DiscountFilters): Promise<BusinessApi[]> {
  const params = new URLSearchParams()
  if (filters?.city?.trim()) {
    params.set('city', filters.city.trim())
  } else if (filters?.cities && filters.cities.length > 0) {
    params.set('cities', filters.cities.map((c) => c.trim()).filter(Boolean).join('|'))
  }
  if (filters?.category?.trim()) params.set('category', filters.category.trim())
  if (filters?.subcategory?.trim()) params.set('subcategory', filters.subcategory.trim())
  if (filters?.q?.trim()) params.set('q', filters.q.trim())
  const query = params.toString()
  const url = `${API_URL}/api/discounts${query ? `?${query}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/** Destacados sin caché (para que siempre se vean los actuales) */
export async function fetchFeaturedFresh(): Promise<BusinessApi[]> {
  const url = API_URL ? `${API_URL}/api/featured` : '/api/featured'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function fetchCities() {
  return safeFetch<string[]>(`${API_URL}/api/cities`, []);
}

/** Para cargar en el servidor sin caché (registro de empresa, etc.) */
export async function fetchCitiesFresh(): Promise<string[]> {
  const url = API_URL ? `${API_URL}/api/cities` : '/api/cities'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.filter((c: string) => c !== 'Todas las ciudades') : []
  } catch {
    return []
  }
}

export async function fetchStats() {
  return safeFetch<{ businessCount: number; monthlyVisitors: number }>(`${API_URL}/api/stats`, { businessCount: 0, monthlyVisitors: 15000 });
}

export type BusinessApi = {
  id: number
  name: string
  slug: string
  location: string | null
  city: string
  rating: number | null
  image_url: string | null
  featured: number
  discount_percent?: number
  category: string | null
  category_slug: string | null
  opening_hours?: string | null
  is_open?: boolean
  open_label?: string | null
  open_detail?: string | null
}

/** Detalle de negocio (incluye descripción, teléfono, Instagram, horarios, menú, galería, coordenadas) */
export type BusinessDetailApi = BusinessApi & {
  description?: string | null
  phone?: string | null
  instagram_url?: string | null
  opening_hours?: string | null
  menu_services?: string | null
  gallery_images?: string[]
  latitude?: number | null
  longitude?: number | null
  subcategory_slug?: string | null
  /** Todas las subcategorías asociadas (principal + adicionales). */
  subcategory_slugs?: string[] | null
}

export async function fetchBusinesses(
  categorySlug?: string,
  subcategorySlug?: string,
  city?: string,
  query?: string,
  /** Sin distrito concreto: todos los distritos del departamento elegido */
  cities?: string[]
): Promise<BusinessApi[]> {
  const params = new URLSearchParams()
  if (categorySlug) params.set('category', categorySlug)
  if (subcategorySlug) params.set('subcategory', subcategorySlug)
  if (city?.trim()) {
    params.set('city', city.trim())
  } else if (cities && cities.length > 0) {
    params.set('cities', cities.map((c) => c.trim()).filter(Boolean).join('|'))
  }
  if (query?.trim()) params.set('q', query.trim())
  const qs = params.toString()
  return safeFetch<BusinessApi[]>(`${API_URL}/api/businesses${qs ? `?${qs}` : ''}`, [])
}

export async function fetchBusinessBySlug(slug: string): Promise<BusinessDetailApi | null> {
  const url = `${API_URL}/api/businesses/${encodeURIComponent(slug)}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export type CreateBusinessPayload = {
  name: string
  category_slug: string
  /** Slugs de subcategoría adicionales (misma categoría; la principal va en subcategory_slug). */
  subcategory_slugs?: string[]
  subcategory_slug?: string
  city: string
  location?: string
  latitude?: number | null
  longitude?: number | null
  description?: string
  phone?: string
  instagram_url?: string
  opening_hours?: string
  menu_services?: string
  image_url?: string
  gallery_images?: string[]
  featured?: boolean
  discount_percent?: number
}

export async function createBusiness(
  payload: CreateBusinessPayload,
  token: string
): Promise<{ slug?: string; error?: string }> {
  const res = await fetch(`${API_URL}/api/businesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data.error || 'Error al registrar la empresa'
    const extra = data.received_slug ? ` (recibido: "${data.received_slug}")` : ''
    return { error: msg + extra }
  }
  return { slug: data.slug }
}

export type UpdateBusinessPayload = {
  name?: string
  category_slug?: string
  subcategory_slugs?: string[]
  subcategory_slug?: string
  city?: string
  location?: string
  latitude?: number | null
  longitude?: number | null
  description?: string
  phone?: string
  instagram_url?: string
  opening_hours?: string
  menu_services?: string
  image_url?: string
  gallery_images?: string[]
  featured?: boolean
  discount_percent?: number
}

export async function updateBusiness(
  slug: string,
  payload: UpdateBusinessPayload,
  token: string
): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/businesses/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al actualizar' }
  return {}
}

export async function deleteBusiness(slug: string, token: string): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/businesses/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return {}
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al eliminar' }
  return {}
}

// --- Formulario de contacto (Solicitá tu publicación) ---
export type ContactPayload = {
  nombre: string
  telefono?: string
  email: string
  negocio?: string
  categoria?: string
  ciudad?: string
  mensaje?: string
}

export async function submitContactForm(payload: ContactPayload): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: (data.error as string) || 'Error al enviar la solicitud' }
  return {}
}

// --- Favoritos (solo para usuarios logueados) ---
export async function fetchFavorites(token: string): Promise<BusinessApi[]> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const data = await res.json().catch(() => [])
  return Array.isArray(data) ? data : []
}

export async function addFavorite(slug: string, token: string): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slug }),
  })
  if (res.status === 201) return {}
  const data = await res.json().catch(() => ({}))
  return { error: data.error || 'Error al agregar' }
}

export async function removeFavorite(slug: string, token: string): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/favorites/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return {}
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al quitar' }
  return {}
}

export async function checkIsFavorite(slug: string, token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/favorites/check/${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return false
  const data = await res.json().catch(() => ({}))
  return !!data.isFavorite
}

// --- Perfil (actualizar nombre y/o contraseña) ---
export type UpdateProfilePayload = {
  name?: string
  current_password?: string
  new_password?: string
}

export async function updateProfile(
  payload: UpdateProfilePayload,
  token: string
): Promise<{ user?: { id: number; name: string; email: string; role: string }; error?: string }> {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al actualizar' }
  return { user: data.user }
}

// --- Admin: Clientes ---
export type ClientUser = {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export async function fetchUsers(token: string): Promise<ClientUser[]> {
  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar clientes')
  return res.json()
}

export type UpdateClientPayload = { name?: string; email?: string; new_password?: string }

export async function updateClient(
  id: number,
  payload: UpdateClientPayload,
  token: string
): Promise<{ user?: ClientUser; error?: string }> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al actualizar' }
  return { user: data }
}

export async function deleteClient(id: number, token: string): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error || 'Error al eliminar' }
  return {}
}
