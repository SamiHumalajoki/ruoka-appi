import { useState } from 'react';
import { C } from '../constants.js';
import Icon from './Icon.jsx';
import Badge from './Badge.jsx';

const SEARCH_PROMPT = (q) => `Etsi resepti suomalaiselle perheelle hakusanalla "${q}". Vastaa pelkällä JSON:lla muodossa:
{"name":"Reseptin nimi","time":40,"servings":4,"slots":["lounas","paivallinen"],"tags":["kasvis","keitto"],"ingredients":["500 g jauhelihaa","1 sipuli"],"steps":["Vaihe 1.","Vaihe 2."]}

Säännöt:
- name suomeksi
- time minuutteina kokonaisluku
- servings: monelleko se on suunniteltu (yleensä 4)
- slots: ["lounas"], ["paivallinen"] tai molemmat
- tags: lista 2-4 tagia näistä: kasvis, kala, kana, liha, pasta, keitto, uuni, perinteinen, arki, perhe, etninen, laatikko, salaatti, wok
- ingredients: 5-12 aineksta määrineen suomeksi
- steps: 3-6 selkeää valmistusvaihetta suomeksi

Palauta VAIN JSON, ei mitään muuta tekstiä.`;

const palette = [
  { bg: '#FFD3B5', fg: '#7A3B1E', glyph: '●' },
  { bg: '#CDE7EA', fg: '#1A4146', glyph: '~' },
  { bg: '#D8E8B0', fg: '#3E5A14', glyph: '∞' },
  { bg: '#FFE7B8', fg: '#7A4E10', glyph: '≡' },
  { bg: '#FCE0B8', fg: '#7A4810', glyph: '◆' },
];

const suggestions = ['Lasagne', 'Curry', 'Tikka masala', 'Lohipasta', 'Borssikeitto', 'Falafel', 'Risotto', 'Paella'];

export default function SearchSheet({ open, onClose, onSave }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const search = async () => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      if (!window.claude?.complete) throw new Error('AI not available');
      const raw = await window.claude.complete(SEARCH_PROMPT(q.trim()));
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Ei JSON-vastausta');
      const data = JSON.parse(match[0]);
      setResult({
        id: 'on' + Date.now(),
        name: data.name || q.trim(),
        time: parseInt(data.time) || 30,
        servings: parseInt(data.servings) || 4,
        slots: Array.isArray(data.slots) && data.slots.length
          ? data.slots.filter(s => ['lounas', 'paivallinen'].includes(s))
          : ['lounas', 'paivallinen'],
        tags: Array.isArray(data.tags) ? data.tags : [],
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        steps: Array.isArray(data.steps) ? data.steps : [],
        badge: palette[Math.floor(Math.random() * palette.length)],
        custom: true,
        online: true,
      });
    } catch {
      setErr('Reseptiä ei löytynyt. Kokeile toista hakusanaa.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setQ(''); setResult(null); setErr(null); };
  const close = () => { reset(); onClose(); };
  const save = () => { if (result) { onSave(result); close(); } };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 230, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(11,40,46,0.45)', animation: 'fadeIn 200ms ease' }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '92%',
        background: C.bg, borderRadius: '28px 28px 0 0',
        animation: 'slideUp 320ms cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px 12px', borderBottom: `1px solid ${C.hair}`, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={close} style={{ background: 'transparent', border: 'none', color: C.ink2, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', padding: 4 }}>
            Sulje
          </button>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>Luo tekoälyllä</div>
          <div style={{ width: 50 }} />
        </div>

        <div style={{ padding: '16px 18px 8px', background: '#fff', borderBottom: `1px solid ${C.hair}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 48,
            background: C.bg, borderRadius: 12, border: `1px solid ${C.hair}`,
          }}>
            <Icon name="search" size={18} color={C.ink3} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Esim. Pad thai, lasagne, dahl…"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15.5, color: C.ink, fontFamily: 'inherit' }}
            />
            <button onClick={search} disabled={!q.trim() || loading} style={{
              height: 36, padding: '0 14px', borderRadius: 11, border: 'none',
              background: !q.trim() || loading ? '#D8E1E3' : C.turk,
              color: '#fff', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit',
              cursor: !q.trim() || loading ? 'default' : 'pointer',
            }}>{loading ? '…' : 'Etsi'}</button>
          </div>
          <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 8, lineHeight: 1.4 }}>
            Resepti haetaan tekoälyllä. Tarkista määrät ja vaiheet ennen valmistusta.
          </div>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: '16px 16px 22px' }}>
          {!result && !loading && !err && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
                Suosittuja hakuja
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => setQ(s)} style={{
                    padding: '10px 14px', borderRadius: 11, border: `1px solid ${C.hair}`,
                    background: '#fff', color: C.ink, fontSize: 13.5, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer', letterSpacing: -0.1,
                  }}>{s}</button>
                ))}
              </div>
            </>
          )}

          {loading && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, margin: '0 auto 14px',
                border: `3px solid ${C.turkSoft}`, borderTopColor: C.turk,
                borderRadius: '50%', animation: 'rospin 0.8s linear infinite',
              }} />
              <div style={{ fontSize: 14, color: C.ink2, fontWeight: 600 }}>Etsitään "{q}"…</div>
            </div>
          )}

          {err && (
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: '#FFEFE4', color: '#9C3F0A',
              fontSize: 13.5, lineHeight: 1.45,
            }}>{err}</div>
          )}

          {result && (
            <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.hair}`, padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Badge recipe={result} size={56} radius={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4,
                    fontSize: 10, fontWeight: 800, color: C.turkDeep, background: C.turkSoft,
                    padding: '2px 7px', borderRadius: 4, letterSpacing: 0.6, textTransform: 'uppercase',
                  }}>
                    <Icon name="spark" size={11} /> Tekoälyn luoma
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: -0.4, lineHeight: 1.15 }}>{result.name}</div>
                  <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 4 }}>
                    {result.time} min · {result.servings} hengelle
                  </div>
                </div>
              </div>

              {result.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  {result.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 12, color: C.turkDark, fontWeight: 600, background: C.turkSoft,
                      padding: '4px 9px', borderRadius: 7,
                    }}>{t}</span>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Aineet</div>
                <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
                  {result.ingredients.map((ing, k) => <div key={k}>• {ing}</div>)}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Valmistus</div>
                <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
                  {result.steps.map((s, k) => <div key={k} style={{ marginBottom: 4 }}>{k + 1}. {s}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div style={{ padding: '12px 16px 22px', borderTop: `1px solid ${C.hair}`, background: '#fff', display: 'flex', gap: 10 }}>
            <button onClick={() => setResult(null)} style={{
              height: 50, padding: '0 16px', borderRadius: 14, border: `1.5px solid ${C.hair}`,
              background: '#fff', color: C.ink2, fontWeight: 600, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
            }}>Hae uusi</button>
            <button onClick={save} style={{
              flex: 1, height: 50, borderRadius: 14, border: 'none',
              background: C.turk, color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 8px 18px ${C.turk}55`,
            }}>
              <Icon name="plus" size={18} stroke={2.4} /> Tallenna omiin reseptiisi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
