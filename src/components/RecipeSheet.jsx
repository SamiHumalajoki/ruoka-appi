import { useState, useEffect } from 'react';
import { C } from '../constants.js';
import { fmtNum } from '../utils.js';
import { INGREDIENTS_BY_ID } from '../data/ingredients.js';
import Icon from './Icon.jsx';

function fmtIngredient(ing) {
  if (typeof ing === 'string') return ing;
  const entity = INGREDIENTS_BY_ID[ing.id];
  const name = entity?.name ?? ing.id;
  if (ing.qty == null) return name;
  const qty = fmtNum(ing.qty);
  return ing.unit ? `${qty} ${ing.unit} ${name}` : `${qty} ${name}`;
}

export default function RecipeSheet({ open, recipe, status, onClose, onAccept, onReroll, onUnlock, onClear }) {
  const [tab, setTab] = useState('aineet');
  useEffect(() => { if (open) setTab('aineet'); }, [open, recipe?.id]);

  if (!open || !recipe) return null;
  const isPending = status === 'pending';
  const isLocked = status === 'locked';
  const steps = recipe.steps && recipe.steps.length ? recipe.steps : [];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(11,40,46,0.45)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 200ms ease',
      }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '88%',
        background: C.bg, borderRadius: '28px 28px 0 0',
        animation: 'slideUp 320ms cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 0 6px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: C.hair }} />
        </div>
        <div style={{ overflow: 'auto', padding: '4px 20px 16px', flex: 1 }}>
          {/* Hero visual */}
          <div style={{
            height: 160, borderRadius: 18, marginBottom: 16, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${recipe.badge.bg}, ${recipe.badge.bg}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.22 }}>
              <defs>
                <pattern id={`hp-${recipe.id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="14" stroke={recipe.badge.fg} strokeWidth="1.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#hp-${recipe.id})`}/>
            </svg>
            <div style={{
              position: 'relative',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 13, color: recipe.badge.fg, letterSpacing: 1.6, textTransform: 'uppercase',
              padding: '6px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 8,
              backdropFilter: 'blur(6px)',
            }}>{recipe.badge.glyph}  ruokakuva  {recipe.badge.glyph}</div>
          </div>

          {isPending && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8,
              fontSize: 11, fontWeight: 700, color: '#fff', background: C.coral,
              padding: '4px 9px', borderRadius: 5, letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              <Icon name="spark" size={12} /> Uusi ehdotus
            </div>
          )}

          <div style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: -0.6, lineHeight: 1.1 }}>
            {recipe.name}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.ink2, fontWeight: 500,
              background: '#fff', padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.hair}`,
            }}>
              <Icon name="clock" size={13} /> {recipe.time} min
            </span>
            {recipe.tags.map(t => (
              <span key={t} style={{
                fontSize: 12, color: C.turkDark, fontWeight: 600, background: C.turkSoft,
                padding: '5px 10px', borderRadius: 8, letterSpacing: 0.2,
              }}>{t}</span>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4, padding: 4, borderRadius: 14,
              background: '#fff', border: `1px solid ${C.hair}`, marginBottom: 12,
            }}>
              {[{ id: 'aineet', label: 'Aineet' }, { id: 'ohje', label: 'Valmistusohje' }].map(t => {
                const on = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, height: 38, borderRadius: 10, border: 'none',
                    background: on ? C.turk : 'transparent',
                    color: on ? '#fff' : C.ink2,
                    fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
                    letterSpacing: -0.1,
                    boxShadow: on ? `0 2px 6px ${C.turk}33` : 'none',
                    transition: 'background 160ms ease, color 160ms ease',
                  }}>{t.label}</button>
                );
              })}
            </div>

            {tab === 'aineet' && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`, overflow: 'hidden' }}>
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', fontSize: 14.5, color: C.ink,
                    borderBottom: i < recipe.ingredients.length - 1 ? `1px solid ${C.hairSoft}` : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: C.turk, flexShrink: 0 }} />
                    {fmtIngredient(ing)}
                  </div>
                ))}
              </div>
            )}

            {tab === 'ohje' && (
              steps.length === 0 ? (
                <div style={{
                  background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`,
                  padding: '24px 18px', textAlign: 'center', color: C.ink2, fontSize: 14, lineHeight: 1.5,
                }}>
                  Tähän reseptiin ei ole vielä tallennettu valmistusohjetta.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {steps.map((st, i) => (
                    <div key={i} style={{
                      background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`,
                      padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                        background: C.turkSoft, color: C.turkDark,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 13.5, letterSpacing: -0.2, marginTop: 1,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 14.5, color: C.ink, lineHeight: 1.5, paddingTop: 3 }}>
                        {st}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '12px 16px 22px',
          borderTop: `1px solid ${C.hair}`,
          background: '#fff',
          display: 'flex', gap: 10,
        }}>
          {isPending ? (
            <>
              <button onClick={onReroll} style={{
                height: 52, padding: '0 14px', borderRadius: 14,
                background: '#fff', color: C.coralDeep, border: `1.5px solid ${C.coral}`,
                fontWeight: 700, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name="reroll" size={17} /> Arvo uudestaan
              </button>
              <button onClick={onAccept} style={{
                flex: 1, height: 52, borderRadius: 14, border: 'none',
                background: C.turk, color: '#fff', fontWeight: 700, fontSize: 16,
                fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 8px 18px ${C.turk}55`,
              }}>
                <Icon name="check" size={19} /> Hyväksy
              </button>
            </>
          ) : isLocked ? (
            <>
              <button onClick={onClear} style={{
                height: 52, padding: '0 14px', borderRadius: 14,
                background: '#fff', color: C.ink2, border: `1.5px solid ${C.hair}`,
                fontWeight: 600, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="trash" size={16} /> Poista
              </button>
              <button onClick={onUnlock} style={{
                flex: 1, height: 52, borderRadius: 14, border: 'none',
                background: C.coral, color: '#fff', fontWeight: 700, fontSize: 16,
                fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 8px 18px ${C.coral}44`,
              }}>
                <Icon name="reroll" size={18} /> Vaihda annos
              </button>
            </>
          ) : (
            <button onClick={onClose} style={{
              flex: 1, height: 52, borderRadius: 14, border: 'none',
              background: C.turk, color: '#fff', fontWeight: 700, fontSize: 16,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Sulje</button>
          )}
        </div>
      </div>
    </div>
  );
}
