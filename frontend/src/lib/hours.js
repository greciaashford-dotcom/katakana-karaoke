const DAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
const DAY_NAMES = { 1: "lunes", 2: "martes", 3: "miércoles", 4: "jueves", 5: "viernes", 6: "sábado", 7: "domingo" };

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

/** Hora actual en Madrid: { day: 1-7, minutes } */
export const madridNow = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return { day: DAY_INDEX[get("weekday")] || 1, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
};

const session = (hours, day) => {
  const row = (hours || []).find((h) => h.day === day);
  if (!row || row.closed) return null;
  const open = toMinutes(row.open);
  let close = toMinutes(row.close);
  if (open === null || close === null) return null;
  if (close <= open) close += 24 * 60;
  return { open, close, row };
};

/** Estado en vivo del local según el horario semanal. */
export const openStatus = (hours, date = new Date()) => {
  if (!hours?.length) return null;
  const { day, minutes } = madridNow(date);
  const yesterday = day === 1 ? 7 : day - 1;
  const prev = session(hours, yesterday);
  if (prev && minutes + 24 * 60 < prev.close) return { open: true, label: `Abierto ahora · hasta las ${prev.row.close}` };
  const today = session(hours, day);
  if (today && minutes >= today.open && minutes < today.close) return { open: true, label: `Abierto ahora · hasta las ${today.row.close}` };
  if (today && minutes < today.open) return { open: false, label: `Cerrado · abrimos hoy a las ${today.row.open}` };
  for (let i = 1; i <= 7; i += 1) {
    const next = ((day - 1 + i) % 7) + 1;
    const s = session(hours, next);
    if (s) return { open: false, label: `Cerrado · abrimos ${i === 1 ? "mañana" : `el ${DAY_NAMES[next]}`} a las ${s.row.open}` };
  }
  return { open: false, label: "Cerrado temporalmente" };
};

export const todayIndex = () => madridNow().day;

/** Agrupa días consecutivos con el mismo horario: "Lunes a jueves · 20:00–03:30" */
export const groupHours = (hours) => {
  const groups = [];
  (hours || []).forEach((h) => {
    const value = h.closed ? "Cerrado" : `${h.open}–${h.close}`;
    const last = groups[groups.length - 1];
    if (last && last.value === value) last.days.push(h);
    else groups.push({ value, days: [h], closed: h.closed });
  });
  return groups.map((g) => ({ ...g, label: g.days.length > 1 ? `${g.days[0].label} a ${g.days[g.days.length - 1].label.toLowerCase()}` : g.days[0].label }));
};
