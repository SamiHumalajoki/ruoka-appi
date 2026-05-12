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

export function weekKey(monday) {
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
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

export async function fetchState() {
  try {
    const r = await fetch('/api/state');
    if (!r.ok) throw new Error('api error');
    const serverState = await r.json();
    if (Object.keys(serverState).length === 0) {
      const local = loadState();
      if (local) {
        await postState(local);
        return local;
      }
    }
    return Object.keys(serverState).length > 0 ? serverState : null;
  } catch {
    return loadState();
  }
}

export async function postState(s) {
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
  } catch {
    saveState(s);
  }
}

export function pickRandom(pool, exclude = new Set()) {
  const candidates = pool.filter(r => !exclude.has(r.id));
  if (candidates.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Seasonal weighting ───────────────────────────────────────
const SEASONS = {
  talvi:  { months: [11, 0, 1],  boost: ['perinteinen', 'keitto', 'uuni', 'laatikko', 'liha'] },
  kevat:  { months: [2, 3, 4],   boost: ['kasvis', 'kana', 'kala', 'salaatti'] },
  kesa:   { months: [5, 6, 7],   boost: ['kala', 'salaatti', 'kasvis', 'perhe', 'wok'] },
  syksy:  { months: [8, 9, 10],  boost: ['uuni', 'perinteinen', 'keitto', 'liha', 'laatikko'] },
};

export function seasonNow(date = new Date()) {
  const m = date.getMonth();
  return Object.values(SEASONS).find(s => s.months.includes(m)) || null;
}

export function buildPool(recipes, slot, prefs, used = new Set()) {
  let candidates = recipes.filter(r => r.slots.includes(slot) && !used.has(r.id));
  if (prefs.vegOnly) candidates = candidates.filter(r => r.tags.includes('kasvis'));
  if (prefs.customMode === 'vain') candidates = candidates.filter(r => r.custom);
  return candidates;
}

export function computeWeights(pool, prefs) {
  const season = prefs.seasonal ? seasonNow() : null;
  return pool.map(r => {
    let w = 1;
    if (prefs.customMode === 'suosi' && r.custom) w *= 5;
    if (season) {
      const hit = r.tags.some(t => season.boost.includes(t));
      if (hit) w *= 2.5;
    }
    return w;
  });
}

export function weightedPick(pool, weights) {
  if (pool.length === 0) return null;
  const w = pool.map((_, i) => weights[i] || 1);
  const total = w.reduce((a, b) => a + b, 0);
  let n = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    n -= w[i];
    if (n <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ── Shopping ingredient parsing ──────────────────────────────
const UNITS = ['g','kg','dl','l','ml','tl','rkl','prk','kpl','pkt','tlk','pala','palaa','pussi','pussia','kourallinen','ripaus'];
const UNIT_RX = new RegExp('^(' + UNITS.join('|') + ')\\b\\.?', 'i');

export function parseQty(text) {
  const m = text.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return { qty: null, unit: '', rest: text.trim(), raw: text };
  const qty = parseFloat(m[1].replace(',', '.'));
  if (!isFinite(qty) || qty <= 0) return { qty: null, unit: '', rest: text.trim(), raw: text };
  const after = m[2];
  const um = after.match(UNIT_RX);
  if (um) {
    const rest = after.slice(um[0].length).trim();
    return { qty, unit: um[1].toLowerCase().replace(/\.$/, ''), rest, raw: text };
  }
  return { qty, unit: '', rest: after.trim(), raw: text };
}

export function fmtNum(n) {
  if (n < 1) return n.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  if (n < 10) return (Math.round(n * 2) / 2).toString().replace('.', ',');
  return Math.round(n).toString();
}

export function normalizeIng(text) {
  return text
    .toLowerCase()
    .replace(/^\d[\d\s,./]*\s*(g|kg|dl|l|tl|rkl|ml|prk|kpl|pkt|tlk|pala(a)?|kourallinen)\b\.?/i, '')
    .replace(/^[\d.,/\s]+/, '')
    .replace(/[,.()]/g, '')
    .trim();
}

const PANTRY_PATTERNS = [
  /öljy|olivi|rypsi/i,
  /\bsuolaa?\b|\bsuola\b/i,
  /pippur/i,
  /\bmauste|laakerinleh|katajan/i,
  /\bvoi(ta)?\b/i,
  /sokeri|siirapp/i,
  /\bjauho|korppujauho/i,
  /\bvet[tä]?[äa]?\b|\bvesi\b/i,
  /\bsinapp/i,
  /meirami|timjam|oregano|basilik|korianter|\btill[iä]/i,
  /kaneli|kardemumma|inkivääri|chili|jeera|paprik(?!aa)/i,
  /\bcurry|currytahna/i,
  /\bsoija/i,
  /valkosipul/i,
  /etikka|sitruunameh/i,
  /korianter|persilj/i,
];

export function isPantry(text) {
  return PANTRY_PATTERNS.some(rx => rx.test(text));
}

export function gatherIngredients(plan, recipes, eaters = 4) {
  const seen = new Map();
  for (let i = 0; i < 7; i++) {
    for (const slot of ['lounas', 'paivallinen']) {
      const e = plan[`${i}-${slot}`];
      if (!e) continue;
      const r = recipes.find(x => x.id === e.id);
      if (!r) continue;
      const base = r.servings || 4;
      const ratio = eaters / base;
      for (const ing of r.ingredients) {
        const p = parseQty(ing);
        if (p.qty != null) p.qty = p.qty * ratio;
        const key = normalizeIng(ing) || ing;
        if (seen.has(key)) {
          const ex = seen.get(key);
          ex.sources.add(r.name);
          if (p.qty != null && ex.parsed.qty != null && p.unit === ex.parsed.unit) {
            ex.parsed.qty += p.qty;
          } else if (p.qty != null && ex.parsed.qty == null) {
            ex.parsed = p;
          }
        } else {
          seen.set(key, {
            parsed: { ...p },
            key,
            sources: new Set([r.name]),
            pantry: isPantry(ing),
          });
        }
      }
    }
  }
  return [...seen.values()].map(it => {
    const qtyLabel = it.parsed.qty != null
      ? (it.parsed.unit ? `${fmtNum(it.parsed.qty)} ${it.parsed.unit}` : `${fmtNum(it.parsed.qty)}`)
      : '';
    const name = it.parsed.rest || it.parsed.raw;
    const qtyText = it.parsed.qty != null
      ? (it.parsed.unit ? `${fmtNum(it.parsed.qty)} ${it.parsed.unit} ${it.parsed.rest}`.trim()
                        : `${fmtNum(it.parsed.qty)} ${it.parsed.rest}`.trim())
      : it.parsed.raw;
    return { ...it, text: qtyText, qtyLabel, name };
  });
}
