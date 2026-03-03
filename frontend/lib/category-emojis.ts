/**
 * Emojis por categoría y subcategoría (slug).
 * Se usa para mostrar un ícono representativo en cada tarjeta.
 */

export const CATEGORY_EMOJI: Record<string, string> = {
  gastronomia: "🍽️",
  "belleza-y-spa": "💇",
  fitness: "💪",
  cafeterias: "☕",
  salud: "🏥",
  automotriz: "🚗",
  moda: "👗",
  hoteleria: "🏨",
  educacion: "📚",
  transporte: "🚕",
  servicios: "🔧",
  bienestar: "🧘",
  mascotas: "🐾",
  legal: "⚖️",
  inmobiliarias: "🏠",
  farmacias: "💊",
  supermercados: "🛒",
  fotografia: "📷",
  eventos: "🎉",
  tecnologia: "📱",
}

/** Emoji por subcategoría: clave "categorySlug/subcategorySlug" */
export const SUBCATEGORY_EMOJI: Record<string, string> = {
  // Gastronomía
  "gastronomia/pizzeria": "🍕",
  "gastronomia/hamburgueseria": "🍔",
  "gastronomia/parrilla": "🥩",
  "gastronomia/sushi": "🍣",
  "gastronomia/comida-rapida": "🌮",
  "gastronomia/comida-internacional": "🍽️",
  "gastronomia/postres-reposteria": "🍰",
  // Belleza y Spa
  "belleza-y-spa/peluquerias": "💇",
  "belleza-y-spa/barberias": "💈",
  "belleza-y-spa/spa": "💆",
  "belleza-y-spa/unas": "💅",
  "belleza-y-spa/estetica": "✨",
  // Fitness
  "fitness/gimnasios": "💪",
  "fitness/yoga": "🧘",
  "fitness/pilates": "🤸",
  "fitness/crossfit": "🏋️",
  "fitness/nutricion-deportiva": "🥗",
  // Cafeterías
  "cafeterias/cafe-especialidad": "☕",
  "cafeterias/panaderias": "🥖",
  "cafeterias/confiterias": "🍩",
  // Salud
  "salud/clinica": "🏥",
  "salud/farmacia": "💊",
  "salud/gimnasio": "💪",
  "salud/odontologia": "🦷",
  "salud/pediatria": "👶",
  "salud/laboratorios": "🧪",
  // Automotriz
  "automotriz/talleres-mecanicos": "🔧",
  "automotriz/lubricentros": "🛢️",
  "automotriz/cerrajeria-automotriz": "🔑",
  "automotriz/concesionarias": "🚗",
  // Moda
  "moda/ropa-mujer": "👗",
  "moda/ropa-hombre": "👔",
  "moda/calzado": "👟",
  "moda/accesorios": "👜",
  "moda/boutiques": "👛",
  // Hotelería
  "hoteleria/hoteles": "🏨",
  "hoteleria/hostels": "🛏️",
  "hoteleria/apart-hoteles": "🏢",
  "hoteleria/posadas": "🏡",
  // Educación
  "educacion/idiomas": "🗣️",
  "educacion/musica": "🎵",
  "educacion/informatica": "💻",
  "educacion/cursos-talleres": "📖",
  // Transporte
  "transporte/taxis": "🚕",
  "transporte/remises": "🚙",
  "transporte/envios": "📦",
  "transporte/alquiler-autos": "🚗",
  // Servicios
  "servicios/plomeria": "🔧",
  "servicios/electricidad": "💡",
  "servicios/limpieza": "🧹",
  "servicios/mudanzas": "📦",
  // Bienestar
  "bienestar/psicologia": "🧠",
  "bienestar/masajes": "💆",
  "bienestar/meditacion": "🧘",
  "bienestar/nutricion": "🥗",
  // Mascotas
  "mascotas/veterinarias": "🏥",
  "mascotas/tiendas-mascotas": "🐕",
  "mascotas/peluqueria-canina": "✂️",
  // Legal
  "legal/civil": "📜",
  "legal/laboral": "👷",
  "legal/inmobiliario": "🏠",
  // Inmobiliarias
  "inmobiliarias/ventas": "🏷️",
  "inmobiliarias/alquileres": "🔑",
  "inmobiliarias/administracion": "📋",
  // Farmacias
  "farmacias/farmacias": "💊",
  "farmacias/droguerias": "💊",
  // Supermercados
  "supermercados/supermercados": "🛒",
  "supermercados/minimercados": "🏪",
  "supermercados/almacenes": "📦",
  // Fotografía
  "fotografia/estudios": "📷",
  "fotografia/eventos": "📸",
  "fotografia/impresion": "🖨️",
  // Eventos
  "eventos/salones": "🎊",
  "eventos/catering": "🍽️",
  "eventos/decoracion": "🎀",
  "eventos/musica-vivo": "🎵",
  // Tecnología
  "tecnologia/reparacion-celulares": "📱",
  "tecnologia/informatica": "💻",
  "tecnologia/electronica": "🔌",
}

export function getCategoryEmoji(categorySlug: string): string {
  return CATEGORY_EMOJI[categorySlug] ?? "📌"
}

export function getSubcategoryEmoji(categorySlug: string, subcategorySlug: string): string {
  const key = `${categorySlug}/${subcategorySlug}`
  return SUBCATEGORY_EMOJI[key] ?? getCategoryEmoji(categorySlug)
}
