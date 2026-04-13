/**
 * Departamentos y distritos de Paraguay (filtros de ubicación).
 * Región Oriental / Occidental (Chaco) + Distrito Capital.
 * El valor enviado a la API como `city` es el nombre del distrito.
 */

export type ParaguayRegion = "capital" | "oriental" | "occidental"

export type ParaguayDepartment = {
  key: string
  name: string
  region: ParaguayRegion
  districts: string[]
}

/** Orden dentro de cada región (capital primero, luego oriental, luego occidental). */
export const PARAGUAY_DEPARTMENTS: ParaguayDepartment[] = [
  {
    key: "distrito-capital",
    name: "Asunción (Distrito Capital)",
    region: "capital",
    districts: ["Asunción"],
  },
  {
    key: "central",
    name: "Central",
    region: "oriental",
    districts: [
      "Areguá",
      "Capiatá",
      "Fernando de la Mora",
      "Guarambaré",
      "Itá",
      "Itauguá",
      "Lambaré",
      "Limpio",
      "Luque",
      "Mariano Roque Alonso",
      "Nueva Italia",
      "Ñemby",
      "San Antonio",
      "San Lorenzo",
      "Villa Elisa",
      "Villeta",
      "Ypacaraí",
      "Ypané",
      "J. Augusto Saldívar",
    ],
  },
  {
    key: "alto-parana",
    name: "Alto Paraná",
    region: "oriental",
    districts: [
      "Ciudad del Este",
      "Doctor Juan León Mallorquín",
      "Doctor Raúl Peña",
      "Domingo Martínez de Irala",
      "Hernandarias",
      "Iruña",
      "Itakyry",
      "Juan Emilio O'Leary",
      "Los Cedrales",
      "Mbaracayú",
      "Minga Guazú",
      "Minga Porá",
      "Naranjal",
      "Ñacunday",
      "Presidente Franco",
      "San Alberto",
      "San Cristóbal",
      "Santa Fe del Paraná",
      "Santa Rita",
      "Santa Rosa del Monday",
      "Tavapy",
      "Yguazú",
    ],
  },
  {
    key: "itapua",
    name: "Itapúa",
    region: "oriental",
    districts: [
      "Alto Verá",
      "Bella Vista",
      "Cambyretá",
      "Capitán Meza",
      "Capitán Miranda",
      "Carlos Antonio López",
      "Carmen del Paraná",
      "Coronel Bogado",
      "Edelira",
      "Encarnación",
      "Fram",
      "General Artigas",
      "General Delgado",
      "Hohenau",
      "Itapúa Poty",
      "Jesús",
      "José Leandro Oviedo",
      "La Paz",
      "Mayor Julio Dionisio Otaño",
      "Natalio",
      "Nueva Alborada",
      "Obligado",
      "Pirapó",
      "San Cosme y Damián",
      "San Juan del Paraná",
      "San Pedro del Paraná",
      "San Rafael del Paraná",
      "Tomás Romero Pereira",
      "Trinidad",
      "Yatytay",
    ],
  },
  {
    key: "caaguazu",
    name: "Caaguazú",
    region: "oriental",
    districts: [
      "Caaguazú",
      "Carayaó",
      "Coronel Oviedo",
      "Doctor Cecilio Báez",
      "Doctor J. Eulogio Estigarribia",
      "Doctor Juan Manuel Frutos",
      "José Ocampos",
      "La Pastora",
      "Mariscal Francisco Solano López",
      "Nueva Londres",
      "Raúl Arsenio Oviedo",
      "Repatriación",
      "R. I. Tres Corrales",
      "San Joaquín",
      "San José de los Arroyos",
      "Santa Rosa del Mbutuy",
      "Simón Bolívar",
      "Tres de Febrero",
      "Vaquería",
      "Yhú",
    ],
  },
  {
    key: "cordillera",
    name: "Cordillera",
    region: "oriental",
    districts: [
      "Altos",
      "Arroyos y Esteros",
      "Atyrá",
      "Caacupé",
      "Caraguatay",
      "Emboscada",
      "Eusebio Ayala",
      "Isla Pucú",
      "Itacurubí de la Cordillera",
      "Juan de Mena",
      "Loma Grande",
      "Mbocayaty del Yhaguy",
      "Nueva Colombia",
      "Piribebuy",
      "Primero de Marzo",
      "San Bernardino",
      "San José Obrero",
      "Santa Elena",
      "Tobatí",
      "Valenzuela",
    ],
  },
  {
    key: "concepcion",
    name: "Concepción",
    region: "oriental",
    districts: [
      "Arroyito",
      "Azotey",
      "Belén",
      "Concepción",
      "Horqueta",
      "Itacuá",
      "Loreto",
      "Paso Barreto",
      "San Alfredo",
      "San Carlos del Apa",
      "San Lázaro",
      "Yby Yaú",
    ],
  },
  {
    key: "misiones",
    name: "Misiones",
    region: "oriental",
    districts: [
      "San Juan Bautista",
      "Ayolas",
      "San Ignacio",
      "San Miguel",
      "San Patricio",
      "Santa María",
      "Santa Rosa",
      "Santiago",
      "Villa Florida",
      "Yabebyry",
    ],
  },
  {
    key: "guaira",
    name: "Guairá",
    region: "oriental",
    districts: [
      "Villarrica",
      "Borja",
      "Capitán Mauricio José Troche",
      "Colonia Independencia",
      "Coronel Martínez",
      "Doctor Botrell",
      "Félix Pérez Cardozo",
      "General Eugenio A. Garay",
      "Itapé",
      "Iturbe",
      "José A. Fassardi",
      "Mbocayaty del Guairá",
      "Natalicio Talavera",
      "Ñumí",
      "Paso Yobai",
      "San Salvador",
      "Tebicuary",
      "Yataity del Guairá",
    ],
  },
  {
    key: "caazapa",
    name: "Caazapá",
    region: "oriental",
    districts: [
      "Caazapá",
      "Abaí",
      "Buena Vista",
      "Doctor Moisés S. Bertoni",
      "Fulgencio Yegros",
      "General Higinio Morínigo",
      "Maciel",
      "San Juan Nepomuceno",
      "Tavaí",
      "Yuty",
      "3 de Mayo",
    ],
  },
  {
    key: "paraguari",
    name: "Paraguarí",
    region: "oriental",
    districts: [
      "Paraguarí",
      "Acahay",
      "Caapucú",
      "Carapeguá",
      "Escobar",
      "General Bernardino Caballero",
      "La Colmena",
      "María Antonia",
      "Mbuyapey",
      "Pirayú",
      "Quiindy",
      "Quyquyhó",
      "San Roque González de Santa Cruz",
      "Sapucaí",
      "Tebicuarymí",
      "Yaguarón",
      "Ybycuí",
      "Ybytimí",
    ],
  },
  {
    key: "san-pedro",
    name: "San Pedro",
    region: "oriental",
    districts: [
      "San Pedro de Ycuamandiyú",
      "25 de Diciembre",
      "Antequera",
      "Capiibary",
      "Choré",
      "General Elizardo Aquino",
      "General Francisco Isidoro Resquín",
      "Guayaibí",
      "Itacurubí del Rosario",
      "Liberación",
      "Lima",
      "Nueva Germania",
      "San Estanislao",
      "San José del Rosario",
      "San Pablo",
      "San Vicente Pancholo",
      "Santa Rosa del Aguaray",
      "Tacuatí",
      "Unión",
      "Villa del Rosario",
      "Yataity del Norte",
      "Yrybucuá",
    ],
  },
  {
    key: "neembucu",
    name: "Ñeembucú",
    region: "oriental",
    districts: [
      "Pilar",
      "Alberdi",
      "Cerrito",
      "Desmochados",
      "General José Eduvigis Díaz",
      "Guazú Cuá",
      "Humaitá",
      "Isla Umbú",
      "Laureles",
      "Mayor José J. Martínez",
      "Paso de Patria",
      "San Juan Bautista del Ñeembucú",
      "Tacuaras",
      "Villa Franca",
      "Villa Oliva",
      "Villalbín",
    ],
  },
  {
    key: "amambay",
    name: "Amambay",
    region: "oriental",
    districts: [
      "Pedro Juan Caballero",
      "Bella Vista Norte",
      "Capitán Bado",
      "Cerro Corá",
      "Karapaí",
      "Zanja Pytá",
    ],
  },
  {
    key: "canindeyu",
    name: "Canindeyú",
    region: "oriental",
    districts: [
      "Salto del Guairá",
      "Corpus Christi",
      "Curuguaty",
      "General Francisco Caballero Álvarez",
      "Itanará",
      "Katueté",
      "La Paloma",
      "Laurel",
      "Maracaná",
      "Nueva Esperanza",
      "Puerto Adela",
      "Villa Ygatimí",
      "Yasy Cañy",
      "Yby Pytá",
      "Ybyrarobaná",
      "Ypehú",
    ],
  },
  {
    key: "presidente-hayes",
    name: "Presidente Hayes",
    region: "occidental",
    districts: [
      "Villa Hayes",
      "Benjamín Aceval",
      "Nanawa",
      "Puerto Pinasco",
      "Doctor José María Rodríguez de Francia",
      "General José María Bruguez",
      "José Falcón",
      "Teniente Primero Manuel Irala Fernández",
    ],
  },
  {
    key: "boqueron",
    name: "Boquerón",
    region: "occidental",
    districts: ["Filadelfia", "Loma Plata", "Mariscal Estigarribia", "Boquerón"],
  },
  {
    key: "alto-paraguay",
    name: "Alto Paraguay",
    region: "occidental",
    districts: [
      "Fuerte Olimpo",
      "Bahía Negra",
      "Capitán Carmelo Peralta",
      "Puerto Casado",
    ],
  },
]

/** Variantes / nombres antiguos → distrito canónico (misma capitalización que en `districts`). */
const DISTRICT_NAME_ALIASES: Record<string, string> = {
  "juan leon mallorquin": "Doctor Juan León Mallorquín",
  "carmelo peralta": "Capitán Carmelo Peralta",
  "capitan carmelo peralta": "Capitán Carmelo Peralta",
  azotey: "Azotey",
  "azote y": "Azotey",
  "san pedro de ycuamandyyu": "San Pedro de Ycuamandiyú",
  santani: "San Estanislao",
  "san estanislao santaní": "San Estanislao",
  "general resquin": "General Francisco Isidoro Resquín",
  "general francisco isidoro resquin": "General Francisco Isidoro Resquín",
  "paso yobay": "Paso Yobai",
  "paso yovai": "Paso Yobai",
  mbocayaty: "Mbocayaty del Guairá",
  "mbocayaty del guaira": "Mbocayaty del Guairá",
  "doctor moises bertoni": "Doctor Moisés S. Bertoni",
  "doctor moises s bertoni": "Doctor Moisés S. Bertoni",
  "general diaz": "General José Eduvigis Díaz",
  "general jose eduvigis diaz": "General José Eduvigis Díaz",
  karapai: "Karapaí",
  "independencia": "Colonia Independencia",
  sapucai: "Sapucaí",
}

export function getDepartmentsGrouped(): { label: string; items: ParaguayDepartment[] }[] {
  const capital = PARAGUAY_DEPARTMENTS.filter((d) => d.region === "capital")
  const oriental = PARAGUAY_DEPARTMENTS.filter((d) => d.region === "oriental")
  const occidental = PARAGUAY_DEPARTMENTS.filter((d) => d.region === "occidental")
  return [
    { label: "Distrito Capital", items: capital },
    { label: "Región Oriental", items: oriental },
    { label: "Región Occidental (Chaco)", items: occidental },
  ].filter((g) => g.items.length > 0)
}

function normLocation(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
}

/** Normaliza un texto de distrito para coincidir con listas y datos viejos en la API. */
export function canonicalizeDistrictName(input: string): string {
  const t = String(input ?? "").trim()
  if (!t) return ""
  const n = normLocation(t)
  if (DISTRICT_NAME_ALIASES[n]) return DISTRICT_NAME_ALIASES[n]
  for (const dept of PARAGUAY_DEPARTMENTS) {
    for (const dist of dept.districts) {
      if (normLocation(dist) === n) return dist
    }
  }
  return t
}

export function getDistrictsForDepartment(departmentKey: string): string[] {
  const d = PARAGUAY_DEPARTMENTS.find((x) => x.key === departmentKey)
  return d ? [...d.districts] : []
}

export function findDepartmentKeyForDistrict(district: string): string | null {
  const canon = canonicalizeDistrictName(district)
  const n = normLocation(canon)
  if (!n) return null
  for (const dept of PARAGUAY_DEPARTMENTS) {
    for (const dist of dept.districts) {
      if (normLocation(dist) === n) return dept.key
    }
  }
  return null
}

export function getDepartmentName(departmentKey: string): string {
  return PARAGUAY_DEPARTMENTS.find((d) => d.key === departmentKey)?.name ?? ""
}
