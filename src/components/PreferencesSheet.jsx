import { useMemo } from 'react';
import { C } from '../constants.js';
import { seasonNow } from '../utils.js';
import Icon from './Icon.jsx';

const SEASONS = {
  talvi: { months: [11, 0, 1], label: 'Talvi', hue: '#4A6FA5', boost: ['perinteinen', 'keitto', 'uuni', 'laatikko', 'liha'] },
  kevat: { months: [2, 3, 4],  label: 'Kevät', hue: '#5FB088', boost: ['kasvis', 'kana', 'kala', 'salaatti'] },
  kesa:  { months: [5, 6, 7],  label: 'Kesä',  hue: '#F4B740', boost: ['kala', 'salaatti', 'kasvis', 'perhe', 'wok'] },
  syksy: { months: [8, 9, 10], label: 'Syksy', hue: '#C97A3A', boost: ['uuni', 'perinteinen', 'keitto', 'liha', 'laatikko'] },
};

function getCurrentSeason() {
  const m = new Date().getMonth();
  return Object.values(SEASONS).find(s => s.months.includes(m)) || null;
}

function Section({ title, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase' }}>{title}</div>
        {hint && <div style={{ fontSize: 11.5, color: C.ink3 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Hint({ children, warn }) {
  return (
    <div style={{
      marginTop: 8, fontSize: 12.5, lineHeight: 1.45,
      color: warn ? '#9C3F0A' : C.ink2,
      padding: '8px 12px', borderRadius: 10,
      background: warn ? '#FFEFE4' : C.hairSoft,
    }}>{children}</div>
  );
}

function Stepper({ value, onChange, min = 1, max = 12 }) {
  const btn = (op, dim) => (
    <button
      onClick={() => !dim && onChange(op === '+' ? Math.min(max, value + 1) : Math.max(min, value - 1))}
      disabled={dim}
      style={{
        width: 36, height: 36, borderRadius: 10,
        border: `1.5px solid ${dim ? C.hair : C.turk}33`,
        background: '#fff', color: dim ? C.ink3 : C.turkDark,
        cursor: dim ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 18, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>{op}</button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {btn('−', value <= min)}
      <div style={{ minWidth: 36, textAlign: 'center', fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: -0.4 }}>
        {value}
      </div>
      {btn('+', value >= max)}
    </div>
  );
}

function SegRow({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}` }}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flex: 1, height: 38, borderRadius: 10, border: 'none',
            background: on ? C.turk : 'transparent',
            color: on ? '#fff' : C.ink2,
            fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
            letterSpacing: -0.1,
            boxShadow: on ? `0 2px 6px ${C.turk}33` : 'none',
            transition: 'background 160ms ease, color 160ms ease',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', background: '#fff', border: `1px solid ${C.hair}`,
      borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{
        width: 46, height: 28, borderRadius: 9, flexShrink: 0,
        background: value ? C.turk : C.hair, position: 'relative',
        transition: 'background 180ms ease',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2, width: 24, height: 24,
          borderRadius: 7, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 180ms cubic-bezier(.4,1.4,.6,1)',
        }} />
      </div>
    </button>
  );
}

export default function PreferencesSheet({ open, onClose, prefs, onChange, recipes }) {
  if (!open) return null;
  const season = getCurrentSeason();
  const counts = useMemo(() => ({
    veg: recipes.filter(r => r.tags.includes('kasvis')).length,
    own: recipes.filter(r => r.custom).length,
  }), [recipes]);

  const set = (k, v) => onChange({ ...prefs, [k]: v });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 240, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(11,40,46,0.45)', animation: 'fadeIn 200ms ease' }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '92%',
        background: C.bg, borderRadius: '28px 28px 0 0',
        animation: 'slideUp 320ms cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px 12px', borderBottom: `1px solid ${C.hair}`, background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.turkDeep, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Painotukset
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.4, marginTop: 2 }}>
            Räätälöi arvontaa
          </div>
        </div>

        <div style={{ overflow: 'auto', padding: '18px 16px 22px', flex: 1 }}>
          <Section title="Ruokailijat">
            <div style={{
              background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`, padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>Perheen koko</div>
                <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>Ostoslistan määrät skaalataan</div>
              </div>
              <Stepper value={prefs.eaters} min={1} max={12} onChange={v => set('eaters', v)} />
            </div>
          </Section>

          <Section title="Omat reseptit" hint={`${counts.own} kpl`}>
            <SegRow value={prefs.customMode} onChange={v => set('customMode', v)} options={[
              { v: 'off',   label: 'Tasaisesti' },
              { v: 'suosi', label: 'Suosi' },
              { v: 'vain',  label: 'Vain omat' },
            ]} />
            {prefs.customMode === 'vain' && counts.own < 3 && (
              <Hint warn>Sinulla on vain {counts.own} omaa reseptiä. Lisää lisää tai vaihda asetus.</Hint>
            )}
          </Section>

          <Section title="Ruokavalio">
            <Toggle
              label="Vain kasvisruoat"
              hint={`${counts.veg} kasvisreseptiä saatavilla`}
              value={prefs.vegOnly}
              onChange={v => set('vegOnly', v)}
            />
          </Section>

          <Section title="Vuodenaika">
            <Toggle
              label="Suosi vuodenaikaan sopivia"
              hint={season ? `Nyt ${season.label.toLowerCase()} — ${season.boost.slice(0, 3).join(', ')}` : ''}
              value={prefs.seasonal}
              onChange={v => set('seasonal', v)}
            />
            {prefs.seasonal && season && (
              <div style={{
                marginTop: 10, padding: '14px 16px', borderRadius: 14,
                background: `linear-gradient(135deg, ${season.hue}22, ${season.hue}08)`,
                border: `1px solid ${season.hue}33`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: season.hue }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: -0.1 }}>{season.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {season.boost.map(t => (
                    <span key={t} style={{
                      fontSize: 12, fontWeight: 600, color: C.ink, background: '#fff',
                      padding: '4px 9px', borderRadius: 7, border: `1px solid ${season.hue}44`,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        <div style={{ padding: '12px 16px 22px', borderTop: `1px solid ${C.hair}`, background: '#fff' }}>
          <button onClick={onClose} style={{
            width: '100%', height: 50, borderRadius: 14, border: 'none',
            background: C.turk, color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: `0 8px 18px ${C.turk}55`,
          }}>Valmis</button>
        </div>
      </div>
    </div>
  );
}
