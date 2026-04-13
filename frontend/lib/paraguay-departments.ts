/**
 * Departamentos y distritos de Paraguay (filtros de ubicación).
 * El valor que se envía a la API como `city` es el nombre del distrito.
 */

export type ParaguayDepartment = {
  key: string
  name: string
  districts: string[]
}

export const PARAGUAY_DEPARTMENTS: ParaguayDepartment[] = [
  {
    key: "distrito-capital",
    name: "Distrito Capital",
    districts: ["Asunción"],
  },
  {
    key: "concepcion",
    name: "Concepción",
    districts: [
      "Concepción",
      "Belén",
      "Horqueta",
      "Loreto",
      "San Lázaro",
      "Yby Yaú",
      "Azote'y",
    ],
  },
  {
    key: "san-pedro",
    name: "San Pedro",
    districts: [
      "San Pedro de Ycuamandiyú",
      "Antequera",
      "Capiibary",
      "Choré",
      "Guayaibí",
    ],
  },
  {
    key: "cordillera",
    name: "Cordillera",
    districts: [
      "Caacupé",
      "Altos",
      "Arroyos y Esteros",
      "Atyrá",
      "Caraguatay",
      "Emboscada",
    ],
  },
  {
    key: "guaira",
    name: "Guairá",
    districts: [
      "Villarrica",
      "Borja",
      "Capitán Mauricio José Troche",
      "Colonia Independencia",
    ],
  },
  {
    key: "caaguazu",
    name: "Caaguazú",
    districts: [
      "Coronel Oviedo",
      "Caaguazú",
      "Carayaó",
      "Doctor Cecilio Báez",
      "Doctor Juan Manuel Frutos",
    ],
  },
  {
    key: "caazapa",
    name: "Caazapá",
    districts: [
      "Caazapá",
      "Abaí",
      "Buena Vista",
      "Doctor Moisés S. Bertoni",
      "Fulgencio Yegros",
    ],
  },
  {
    key: "itapua",
    name: "Itapúa",
    districts: [
      "Encarnación",
      "Bella Vista",
      "Cambyretá",
      "Capitán Meza",
      "Capitán Miranda",
      "Carmen del Paraná",
      "Coronel Bogado",
    ],
  },
  {
    key: "misiones",
    name: "Misiones",
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
    key: "paraguari",
    name: "Paraguarí",
    districts: [
      "Paraguarí",
      "Acahay",
      "Caapucú",
      "Carapeguá",
      "Escobar",
      "General Bernardino Caballero",
      "La Colmena",
    ],
  },
  {
    key: "alto-parana",
    name: "Alto Paraná",
    districts: [
      "Ciudad del Este",
      "Hernandarias",
      "Minga Guazú",
      "Presidente Franco",
      "Santa Rita",
    ],
  },
  {
    key: "central",
    name: "Central",
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
    key: "neembucu",
    name: "Ñeembucú",
    districts: [
      "Pilar",
      "Alberdi",
      "Cerrito",
      "Desmochados",
      "General Díaz",
      "Guazú Cuá",
      "Humaitá",
      "Isla Umbú",
    ],
  },
  {
    key: "amambay",
    name: "Amambay",
    districts: ["Pedro Juan Caballero", "Bella Vista", "Capitán Bado", "Zanja Pytá"],
  },
  {
    key: "canindeyu",
    name: "Canindeyú",
    districts: [
      "Salto del Guairá",
      "Corpus Christi",
      "Curuguaty",
      "Katueté",
      "La Paloma",
      "Villa Ygatimí",
    ],
  },
  {
    key: "presidente-hayes",
    name: "Presidente Hayes",
    districts: [
      "Villa Hayes",
      "Benjamín Aceval",
      "Doctor José María Rodríguez de Francia",
      "General José María Bruguez",
    ],
  },
  {
    key: "boqueron",
    name: "Boquerón",
    districts: ["Filadelfia", "Loma Plata", "Mariscal Estigarribia"],
  },
  {
    key: "alto-paraguay",
    name: "Alto Paraguay",
    districts: ["Fuerte Olimpo", "Carmelo Peralta", "Puerto Casado", "Bahía Negra"],
  },
]

function normLocation(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

export function getDistrictsForDepartment(departmentKey: string): string[] {
  const d = PARAGUAY_DEPARTMENTS.find((x) => x.key === departmentKey)
  return d ? [...d.districts] : []
}

/** Si el texto coincide con un distrito conocido, devuelve la key del departamento. */
export function findDepartmentKeyForDistrict(district: string): string | null {
  const n = normLocation(district)
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
