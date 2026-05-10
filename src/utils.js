import { MONTHS_GEN, MONTHS_SHORT } from './constants.js';

export function mondayOf(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const wd = x.getDay();
  x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd));
  return x;
}

export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const ys = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t - ys) / 86400000) + 1) / 7);
}

export function dateAt(monday, idx) {
  const d = new Date(monday);
  d.setDate(d.getDate() + idx);
  return d;
}

export function rangeLabel(monday) {
  const sun = dateAt(monday, 6);
  if (monday.getMonth() === sun.getMonth())
    return `${monday.getDate()}.–${sun.getDate()}. ${MONTHS_GEN[sun.getMonth()]}`;
  return `${monday.getDate()}. ${MONTHS_SHORT[monday.getMonth()]} – ${sun.getDate()}. ${MONTHS_SHORT[sun.getMonth()]}`;
}

export function loadState() {
  try {
    const raw = localStorage.getItem('ruoka-appi-v1');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveState(s) {
  try { localStorage.setItem('ruoka-appi-v1', JSON.stringify(s)); } catch {}
}

export function pickRandom(pool, exclude = new Set()) {
  const candidates = pool.filter(r => !exclude.has(r.id));
  if (candidates.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}
