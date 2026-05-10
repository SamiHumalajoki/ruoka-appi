import { useState, useMemo } from 'react';
import { C, SLOTS } from '../constants.js';
import Icon from './Icon.jsx';
import Badge from './Badge.jsx';

const inputCss = {
  width: '100%', height: 48, padding: '0 14px', borderRadius: 12,
  border: `1px solid ${C.hair}`, background: '#fff',
  fontSize: 16, color: C.ink, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: C.ink3 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function AddSheet({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState(30);
  const [slots, setSlots] = useState(['lounas', 'paivallinen']);
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState('');
  const [stepsText, setStepsText] = useState('');
  const allTags = ['kasvis', 'kala', 'kana', 'liha', 'pasta', 'keitto', 'uuni', 'perinteinen', 'arki', 'perhe'];

  const reset = () => {
    setName(''); setTime(30); setSlots(['lounas', 'paivallinen']);
    setTags([]); setIngredients(''); setStepsText('');
  };

  if (!open) return null;
  const valid = name.trim() && ingredients.trim() && slots.length > 0;

  const toggleSlot = s => setSlots(slots.includes(s) ? slots.filter(x => x !== s) : [...slots, s]);
  const toggleTag = t => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);

  const palette = [
    { bg: '#FFD3B5', fg: '#7A3B1E', glyph: '●' },
    { bg: '#CDE7EA', fg: '#1A4146', glyph: '~' },
    { bg: '#D8E8B0', fg: '#3E5A14', glyph: '∞' },
    { bg: '#FFE7B8', fg: '#7A4E10', glyph: '≡' },
    { bg: '#FCE0B8', fg: '#7A4810', glyph: '◆' },
  ];

  const handleSave = () => {
    if (!valid) return;
    const badge = palette[Math.floor(Math.random() * palette.length)];
    onSave({
      id: 'rc' + Date.now(),
      name: name.trim(),
      time: parseInt(time) || 30,
      slots, tags,
      ingredients: ingredients.split('\n').map(s => s.trim()).filter(Boolean),
      steps: stepsText.split('\n').map(s => s.trim()).filter(Boolean),
      badge,
      custom: true,
    });
    reset();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 220, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={() => { reset(); onClose(); }} style={{
        position: 'absolute', inset: 0, background: 'rgba(11,40,46,0.45)', animation: 'fadeIn 200ms ease',
      }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '92%',
        background: C.bg, borderRadius: '28px 28px 0 0',
        animation: 'slideUp 320ms cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px 10px', borderBottom: `1px solid ${C.hair}`, background: '#fff',
        }}>
          <button onClick={() => { reset(); onClose(); }} style={{
            background: 'transparent', border: 'none', color: C.ink2,
            fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', padding: 4,
          }}>Peru</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.2 }}>Uusi resepti</div>
          <button onClick={handleSave} disabled={!valid} style={{
            background: 'transparent', border: 'none',
            color: valid ? C.turkDeep : C.ink3,
            fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: valid ? 'pointer' : 'default', padding: 4,
          }}>Tallenna</button>
        </div>

        <div style={{ overflow: 'auto', padding: '16px 18px 24px', flex: 1 }}>
          <Field label="Reseptin nimi">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Esim. Mummin lihapullat" style={inputCss} />
          </Field>

          <Field label="Valmistusaika">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px',
              background: '#fff', borderRadius: 12, border: `1px solid ${C.hair}`,
            }}>
              <input type="number" min={1} value={time} onChange={e => setTime(e.target.value)}
                style={{ ...inputCss, height: 'auto', padding: 0, border: 'none', background: 'transparent', width: 60, fontSize: 16 }} />
              <span style={{ color: C.ink2, fontSize: 14 }}>min</span>
            </div>
          </Field>

          <Field label="Sopii ateriaksi">
            <div style={{ display: 'flex', gap: 8 }}>
              {SLOTS.map(s => {
                const on = slots.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSlot(s.id)} style={{
                    flex: 1, height: 48, borderRadius: 12, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
                    border: on ? `1.5px solid ${C.turk}` : `1px solid ${C.hair}`,
                    background: on ? C.turkSoft : '#fff',
                    color: on ? C.turkDark : C.ink2, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name={s.icon} size={15} /> {s.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Aiheet">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allTags.map(t => {
                const on = tags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{
                    padding: '8px 12px', borderRadius: 9, fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    border: on ? `1.5px solid ${C.turk}` : `1px solid ${C.hair}`,
                    background: on ? C.turkSoft : '#fff',
                    color: on ? C.turkDark : C.ink2, cursor: 'pointer',
                  }}>{t}</button>
                );
              })}
            </div>
          </Field>

          <Field label="Aineet" hint="Yksi rivi per aine">
            <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
              placeholder={'500 g jauhelihaa\n1 sipuli\n…'} rows={5}
              style={{ ...inputCss, height: 'auto', padding: 12, lineHeight: 1.5, resize: 'vertical', minHeight: 110 }} />
          </Field>

          <Field label="Valmistusohje" hint="Yksi rivi per vaihe">
            <textarea value={stepsText} onChange={e => setStepsText(e.target.value)}
              placeholder={'Kuullota sipuli pannulla.\nLisää jauheliha ja ruskista.\n…'} rows={5}
              style={{ ...inputCss, height: 'auto', padding: 12, lineHeight: 1.5, resize: 'vertical', minHeight: 120 }} />
          </Field>
        </div>
      </div>
    </div>
  );
}

export default function RecipesScreen({ recipes, onOpen, onAdd }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('kaikki');

  const filtered = useMemo(() => {
    let xs = recipes;
    if (filter !== 'kaikki') xs = xs.filter(r => r.tags.includes(filter) || (filter === 'omat' && r.custom));
    if (q.trim()) {
      const Q = q.toLowerCase();
      xs = xs.filter(r => r.name.toLowerCase().includes(Q) || r.tags.some(t => t.toLowerCase().includes(Q)));
    }
    return xs;
  }, [recipes, q, filter]);

  const filters = [
    { id: 'kaikki', label: 'Kaikki' },
    { id: 'omat', label: 'Omat' },
    { id: 'kasvis', label: 'Kasvis' },
    { id: 'kala', label: 'Kala' },
    { id: 'kana', label: 'Kana' },
    { id: 'liha', label: 'Liha' },
    { id: 'pasta', label: 'Pasta' },
    { id: 'keitto', label: 'Keitto' },
    { id: 'perinteinen', label: 'Perinteinen' },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '8px 22px 12px' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: -0.8 }}>Reseptit</div>
        <div style={{ fontSize: 14, color: C.ink2, marginTop: 4 }}>
          {recipes.length} ruokalajia · {recipes.filter(r => r.custom).length} omaa
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 46,
          background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`,
        }}>
          <Icon name="search" size={18} color={C.ink3} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Etsi reseptiä tai aihetta…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: C.ink, fontFamily: 'inherit' }} />
          {q && (
            <button onClick={() => setQ('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: C.ink3 }}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 12px' }}>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '8px 14px', borderRadius: 10,
              background: filter === f.id ? C.turk : '#fff',
              color: filter === f.id ? '#fff' : C.ink2,
              border: filter === f.id ? 'none' : `1px solid ${C.hair}`,
              fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
              flexShrink: 0, letterSpacing: -0.1,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: C.ink2 }}>Ei tuloksia haulla.</div>
        ) : filtered.map(r => (
          <div key={r.id} onClick={() => onOpen(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, marginBottom: 8, borderRadius: 16,
            background: '#fff', cursor: 'pointer', border: `1px solid ${C.hair}`,
          }}>
            <Badge recipe={r} size={48} radius={13} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15.5, fontWeight: 600, color: C.ink, letterSpacing: -0.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {r.name}
                {r.custom && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, fontWeight: 700, color: C.turkDeep,
                    background: C.turkSoft, padding: '2px 6px', borderRadius: 4,
                    letterSpacing: 0.4, textTransform: 'uppercase',
                  }}>oma</span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="clock" size={11} /> {r.time} min
                </span>
                {r.tags.slice(0, 2).map(t => <span key={t} style={{ color: C.ink3 }}>· {t}</span>)}
              </div>
            </div>
            <Icon name="chev" size={16} color={C.ink3} />
          </div>
        ))}
      </div>

      <button onClick={onAdd} style={{
        position: 'absolute', bottom: 110, right: 18, zIndex: 50,
        width: 60, height: 60, borderRadius: 18, border: 'none',
        background: C.turk, color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 12px 24px ${C.turk}55, 0 2px 4px rgba(0,0,0,0.1)`,
      }}>
        <Icon name="plus" size={28} stroke={2.4} />
      </button>
    </div>
  );
}
