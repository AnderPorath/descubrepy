/** Zona horaria de Paraguay */
const BUSINESS_TZ = 'America/Asuncion';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const DAY_NAME_TO_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

function normalizeDayName(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function timeToMinutes(t) {
  const m = String(t ?? '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return h * 60 + min;
}

function formatMinutes(mins) {
  const normalized = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizeRange(fromMin, toMin) {
  let to = toMin;
  if (toMin === 0) to = 24 * 60;
  else if (toMin < fromMin) to = toMin + 24 * 60;
  return { from: fromMin, to };
}

function getNowInBusinessTz(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = get('weekday');
  let hour = Number(get('hour'));
  if (hour === 24) hour = 0;
  const minute = Number(get('minute'));
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dayIndex: map[weekday] ?? now.getDay(),
    minutes: hour * 60 + minute,
  };
}

function parseWeeklyHours(text) {
  const week = DAY_NAMES.map((dayName, dayIndex) => ({
    dayIndex,
    dayName,
    closed: true,
    ranges: [],
  }));
  if (!text || !String(text).trim()) return week;
  for (const line of String(text).trim().split(/\r?\n/)) {
    const match = line.match(/^\s*([^:]+?)\s*:\s*(.+)$/);
    if (!match) continue;
    const dayIndex = DAY_NAME_TO_INDEX[normalizeDayName(match[1])];
    if (dayIndex === undefined) continue;
    const value = match[2].trim();
    if (/cerrado/i.test(value)) {
      week[dayIndex] = { dayIndex, dayName: DAY_NAMES[dayIndex], closed: true, ranges: [] };
      continue;
    }
    const ranges = [];
    for (const rm of value.matchAll(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g)) {
      const from = timeToMinutes(rm[1]);
      const to = timeToMinutes(rm[2]);
      if (from === null || to === null) continue;
      ranges.push(normalizeRange(from, to));
    }
    ranges.sort((a, b) => a.from - b.from);
    week[dayIndex] = {
      dayIndex,
      dayName: DAY_NAMES[dayIndex],
      closed: ranges.length === 0,
      ranges,
    };
  }
  return week;
}

function isInRange(minutes, range) {
  if (range.to <= 24 * 60) return minutes >= range.from && minutes < range.to;
  return minutes >= range.from || minutes < range.to - 24 * 60;
}

function getOpenStatus(openingHours, now = new Date()) {
  if (!openingHours || !String(openingHours).trim()) {
    return { is_open: false, open_label: 'Horario no disponible', open_detail: null, sort_rank: 2 };
  }
  const week = parseWeeklyHours(openingHours);
  const hasAnyHours = week.some((d) => !d.closed && d.ranges.length > 0);
  if (!hasAnyHours) {
    return { is_open: false, open_label: 'Cerrado', open_detail: null, sort_rank: 1 };
  }
  const { dayIndex, minutes } = getNowInBusinessTz(now);
  const today = week[dayIndex];

  for (const r of today.ranges) {
    if (isInRange(minutes, r)) {
      const closes = r.to >= 24 * 60 ? '00:00' : formatMinutes(r.to);
      return { is_open: true, open_label: 'Abierto ahora', open_detail: `Cierra a las ${closes}`, sort_rank: 0 };
    }
  }

  const yesterday = week[(dayIndex + 6) % 7];
  for (const r of yesterday.ranges) {
    if (r.to > 24 * 60 && minutes < r.to - 24 * 60) {
      return {
        is_open: true,
        open_label: 'Abierto ahora',
        open_detail: `Cierra a las ${formatMinutes(r.to - 24 * 60)}`,
        sort_rank: 0,
      };
    }
  }

  for (const r of today.ranges) {
    if (minutes < r.from) {
      return {
        is_open: false,
        open_label: 'Cerrado',
        open_detail: `Abre hoy a las ${formatMinutes(r.from)}`,
        sort_rank: 1,
      };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = week[(dayIndex + offset) % 7];
    if (day.closed || day.ranges.length === 0) continue;
    const openAt = formatMinutes(day.ranges[0].from);
    if (offset === 1) {
      return { is_open: false, open_label: 'Cerrado', open_detail: `Abre mañana a las ${openAt}`, sort_rank: 1 };
    }
    return {
      is_open: false,
      open_label: 'Cerrado',
      open_detail: `Abre el ${day.dayName.toLowerCase()} a las ${openAt}`,
      sort_rank: 1,
    };
  }

  return { is_open: false, open_label: 'Cerrado', open_detail: null, sort_rank: 1 };
}

function groupRank(featured, status) {
  if (status.sort_rank === 0 && featured) return 0;
  if (status.sort_rank === 0) return 1;
  if (status.sort_rank === 1 && featured) return 2;
  if (status.sort_rank === 1) return 3;
  return 4;
}

/** Añade estado y ordena: destacados abiertos → abiertos → destacados cerrados → cerrados */
function enrichAndSortBusinesses(rows, { preserveOrderWithinGroup = false } = {}) {
  const now = new Date();
  const enriched = (rows || []).map((row, index) => {
    const status = getOpenStatus(row.opening_hours, now);
    return {
      ...row,
      is_open: status.is_open,
      open_label: status.open_label,
      open_detail: status.open_detail,
      _sortRank: status.sort_rank,
      _featured: row.featured ? 1 : 0,
      _index: index,
    };
  });
  enriched.sort((a, b) => {
    const ga = groupRank(a._featured, { sort_rank: a._sortRank });
    const gb = groupRank(b._featured, { sort_rank: b._sortRank });
    if (ga !== gb) return ga - gb;
    if (preserveOrderWithinGroup) return a._index - b._index;
    return a._index - b._index;
  });
  return enriched.map(({ _sortRank, _featured, _index, ...rest }) => rest);
}

module.exports = {
  getOpenStatus,
  enrichAndSortBusinesses,
};
