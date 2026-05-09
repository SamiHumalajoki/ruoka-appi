// Ruoka-appi — perheen viikkoruoka-arpoja
const { useState, useEffect, useRef, useMemo } = React;

// ── Värit ────────────────────────────────────────────────────
const C = {
  turk:      '#14B8A6',  // päävärinä turkoosi
  turkDeep:  '#0E867A',
  turkDark:  '#0B5C56',
  turkLite:  '#D6F4EF',
  turkSoft:  '#EAF8F5',
  coral:     '#FF7A59',  // arvonta-aksentti
  coralDeep: '#E55835',
  coralLite: '#FFE2D8',
  amber:     '#F4B740',  // toissijainen aksentti
  amberLite: '#FFF1D2',
  bg:        '#FAF7F2',
  card:      '#FFFFFF',
  ink:       '#0F2A2E',
  ink2:      '#5C6F72',
  ink3:      '#9CADB0',
  hair:      '#ECE6D8',
  hairSoft:  '#F4EFE3',
};

const DAYS = [
  { full:'Maanantai',   short:'Ma' },
  { full:'Tiistai',     short:'Ti' },
  { full:'Keskiviikko', short:'Ke' },
  { full:'Torstai',     short:'To' },
  { full:'Perjantai',   short:'Pe' },
  { full:'Lauantai',    short:'La' },
  { full:'Sunnuntai',   short:'Su' },
];
const SLOTS = [
  { id:'lounas',      label:'Lounas',      icon:'sun' },
  { id:'paivallinen', label:'Päivällinen', icon:'moon' },
];
const MONTHS_GEN = ['tammikuuta','helmikuuta','maaliskuuta','huhtikuuta','toukokuuta','kesäkuuta','heinäkuuta','elokuuta','syyskuuta','lokakuuta','marraskuuta','joulukuuta'];
const MONTHS_SHORT = ['tam','hel','maa','huh','tou','kes','hei','elo','syy','lok','mar','jou'];

// ── Aikalogiikka ─────────────────────────────────────────────
function mondayOf(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const wd = x.getDay(); // 0..6, 0 = sun
  const diff = (wd === 0 ? -6 : 1 - wd);
  x.setDate(x.getDate() + diff);
  return x;
}
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const ys = new Date(Date.UTC(t.getUTCFullYear(),0,1));
  return Math.ceil((((t - ys)/86400000) + 1)/7);
}
function dateAt(monday, idx) {
  const d = new Date(monday); d.setDate(d.getDate()+idx); return d;
}
function rangeLabel(monday) {
  const sun = dateAt(monday, 6);
  if (monday.getMonth() === sun.getMonth())
    return `${monday.getDate()}.–${sun.getDate()}. ${MONTHS_GEN[sun.getMonth()]}`;
  return `${monday.getDate()}. ${MONTHS_SHORT[monday.getMonth()]} – ${sun.getDate()}. ${MONTHS_SHORT[sun.getMonth()]}`;
}

// ── Yleiset komponentit ──────────────────────────────────────

function Icon({ name, size = 20, color = 'currentColor', stroke = 1.8 }) {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:stroke, strokeLinecap:'round', strokeLinejoin:'round' };
  switch(name) {
    case 'sun':    return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>;
    case 'moon':   return <svg {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>;
    case 'dice':   return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r=".9" fill={color} stroke="none"/><circle cx="15.5" cy="15.5" r=".9" fill={color} stroke="none"/><circle cx="12" cy="12" r=".9" fill={color} stroke="none"/></svg>;
    case 'check':  return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>;
    case 'x':      return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus':   return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'reroll': return <svg {...p}><path d="M21 12a9 9 0 1 1-3.5-7.1"/><path d="M21 4v5h-5"/></svg>;
    case 'home':   return <svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></svg>;
    case 'book':   return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 5v14a2 2 0 0 0 2 2h12"/></svg>;
    case 'clock':  return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'chev':   return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'spark':  return <svg {...p}><path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>;
    case 'trash':  return <svg {...p}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/></svg>;
    case 'flame':  return <svg {...p}><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-1 5 3 5"/></svg>;
    case 'broom':  return <svg {...p}><path d="M14 4l6 6M5 19l5-5 5 5-5 5z"/><path d="M10 14L20 4"/></svg>;
    case 'users':  return <svg {...p}><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c0-2 2-4 4-4s3 1 3 3"/></svg>;
    default: return null;
  }
}

function Badge({ recipe, size = 44, radius = 12 }) {
  if (!recipe) return null;
  const fs = size * 0.42;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: recipe.badge.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink: 0, position:'relative', overflow:'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {/* hieno raidoitettu pohja */}
      <svg width={size} height={size} style={{ position:'absolute', inset:0, opacity:0.18 }}>
        <defs>
          <pattern id={`pat-${recipe.id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={recipe.badge.fg} strokeWidth="1.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-${recipe.id})`}/>
      </svg>
      <span style={{
        position:'relative', color: recipe.badge.fg,
        fontFamily:'ui-monospace, "SF Mono", Menlo, monospace',
        fontWeight: 600, fontSize: fs, letterSpacing: -0.5,
      }}>{recipe.badge.glyph}</span>
    </div>
  );
}

function PrimaryBtn({ children, onClick, icon, color = C.turk, dim = false, full = false, size = 'md' }) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48;
  return (
    <button onClick={onClick} disabled={dim}
      style={{
        height: h, padding: size === 'lg' ? '0 22px' : '0 18px',
        borderRadius: 14, border: 'none',
        background: dim ? '#D8E1E3' : color,
        color: '#fff', fontWeight: 600, fontSize: size === 'lg' ? 17 : 16,
        letterSpacing: -0.2, cursor: dim ? 'default' : 'pointer',
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
        width: full ? '100%' : undefined,
        boxShadow: dim ? 'none' : `0 6px 14px ${color}33, 0 1px 0 rgba(255,255,255,0.25) inset`,
        fontFamily: 'inherit',
        transition: 'transform 80ms ease',
      }}
      onMouseDown={e => !dim && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, icon, color = C.turkDeep, full = false, size = 'md' }) {
  const h = size === 'sm' ? 38 : 44;
  return (
    <button onClick={onClick}
      style={{
        height: h, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${color}33`,
        background: '#fff', color: color, fontWeight: 600, fontSize: size === 'sm' ? 14 : 15,
        letterSpacing: -0.2, cursor: 'pointer', fontFamily: 'inherit',
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
        width: full ? '100%' : undefined,
      }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

window.RU = { C, DAYS, SLOTS, MONTHS_GEN, mondayOf, isoWeek, dateAt, rangeLabel, Icon, Badge, PrimaryBtn, GhostBtn };
