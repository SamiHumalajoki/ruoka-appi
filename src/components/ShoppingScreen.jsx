import { useState, useEffect, useMemo } from 'react';
import { C } from '../constants.js';
import { gatherIngredients, parseQty, fmtNum } from '../utils.js';
import Icon from './Icon.jsx';

function ShopRow({ item, last, onToggle, onRemove }) {
  let qtyLabel = item.qtyLabel;
  let name = item.name;
  if (qtyLabel == null || name == null) {
    const p = parseQty(item.text || '');
    qtyLabel = p.qty != null
      ? (p.unit ? `${fmtNum(p.qty)} ${p.unit}` : `${fmtNum(p.qty)}`)
      : '';
    name = p.rest || p.raw || item.text;
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${C.hairSoft}`,
    }}>
      <button onClick={() => onToggle(item.id)} style={{
        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
        border: `1.8px solid ${item.checked ? C.turk : C.ink3}`,
        background: item.checked ? C.turk : '#fff',
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.checked && <Icon name="check" size={15} color="#fff" stroke={2.6} />}
      </button>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, color: item.checked ? C.ink3 : C.ink,
            fontWeight: 500, letterSpacing: -0.1,
            textDecoration: item.checked ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{name || item.text}</div>
          {item.sources && item.sources.length > 0 && (
            <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.sources.slice(0, 2).join(' · ')}{item.sources.length > 2 ? ` · +${item.sources.length - 2}` : ''}
            </div>
          )}
        </div>
        {qtyLabel && !item.checked && (
          <div style={{
            fontSize: 13, fontWeight: 700, color: C.turkDark,
            background: C.turkSoft, padding: '5px 10px', borderRadius: 9,
            letterSpacing: -0.1, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
          }}>{qtyLabel}</div>
        )}
        {qtyLabel && item.checked && (
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: C.ink3,
            letterSpacing: -0.1, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
            textDecoration: 'line-through',
          }}>{qtyLabel}</div>
        )}
      </div>
      <button onClick={() => onRemove(item.id)} style={{
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
        color: C.ink3,
      }}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

function EmptyShopping() {
  return (
    <div style={{ padding: '30px 30px', textAlign: 'center' }}>
      <div style={{
        width: 76, height: 76, borderRadius: 22, margin: '0 auto 12px',
        background: C.turkSoft, color: C.turkDark,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="check" size={36} stroke={2.2} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>Lista on tyhjä</div>
      <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
        Lisää viikon arvottujen ruokien ainekset napsauttamalla yllä olevaa painiketta.
      </div>
    </div>
  );
}

export function AddToShoppingSheet({ open, plan, recipes, existing, eaters = 4, onClose, onConfirm }) {
  const items = useMemo(() => gatherIngredients(plan, recipes, eaters), [plan, recipes, open, eaters]);
  const fresh = items.filter(i => !i.pantry);
  const pantry = items.filter(i => i.pantry);

  const [picks, setPicks] = useState({});
  useEffect(() => {
    if (!open) return;
    const init = {};
    pantry.forEach(p => { init[p.key] = false; });
    setPicks(init);
  }, [open]);

  if (!open) return null;

  const existingKeys = new Set(existing.map(x => x.key));
  const toAddFresh = fresh.filter(f => !existingKeys.has(f.key));
  const toAddPantry = pantry.filter(p => picks[p.key] && !existingKeys.has(p.key));
  const totalAdd = toAddFresh.length + toAddPantry.length;

  const togglePick = k => setPicks(p => ({ ...p, [k]: !p[k] }));
  const allOn = () => { const n = {}; pantry.forEach(p => n[p.key] = true); setPicks(n); };
  const allOff = () => { const n = {}; pantry.forEach(p => n[p.key] = false); setPicks(n); };

  const miniBtn = {
    height: 28, padding: '0 10px', borderRadius: 8,
    background: '#fff', border: `1px solid ${C.hair}`,
    color: C.ink2, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 230, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(11,40,46,0.45)', animation: 'fadeIn 200ms ease' }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '92%',
        background: C.bg, borderRadius: '28px 28px 0 0',
        animation: 'slideUp 320ms cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px 12px', borderBottom: `1px solid ${C.hair}`, background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.turkDeep, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Ostoslista
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.4, marginTop: 2 }}>
            Tarkista yleiset ainekset
          </div>
          <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 4, lineHeight: 1.45 }}>
            Määrät {eaters} hengelle. Mausteet ja öljyt löytyvät usein kaapista — valitse mitä silti tarvitaan.
          </div>
        </div>

        <div style={{ overflow: 'auto', padding: '16px 16px 12px', flex: 1 }}>
          {pantry.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Tarvitaanko nämä? · {pantry.length} kpl
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={allOn} style={miniBtn}>Kaikki</button>
                  <button onClick={allOff} style={miniBtn}>Ei mitään</button>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`, overflow: 'hidden' }}>
                {pantry.map((p, i) => {
                  const on = !!picks[p.key];
                  const dup = existingKeys.has(p.key);
                  return (
                    <button key={p.key} onClick={() => !dup && togglePick(p.key)} disabled={dup}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', border: 'none', cursor: dup ? 'default' : 'pointer',
                        background: on ? C.turkSoft : '#fff',
                        borderBottom: i < pantry.length - 1 ? `1px solid ${C.hairSoft}` : 'none',
                        textAlign: 'left', fontFamily: 'inherit',
                      }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        border: `1.8px solid ${on || dup ? C.turk : C.ink3}`,
                        background: on || dup ? C.turk : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(on || dup) && <Icon name="check" size={14} color="#fff" stroke={2.6} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, color: C.ink, fontWeight: 500 }}>{p.text}</div>
                        {dup && <div style={{ fontSize: 11, color: C.turkDeep, fontWeight: 600, marginTop: 1 }}>Jo listalla</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
              Lisätään automaattisesti · {toAddFresh.length} kpl
            </div>
            {toAddFresh.length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`,
                padding: '16px 14px', fontSize: 13.5, color: C.ink2, textAlign: 'center',
              }}>
                {existing.length > 0 ? 'Kaikki tuoreet ainekset jo listalla.' : 'Ei tuoreita aineksia.'}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.hair}`, overflow: 'hidden' }}>
                {toAddFresh.map((f, i) => (
                  <div key={f.key} style={{
                    padding: '10px 14px', fontSize: 14, color: C.ink,
                    borderBottom: i < toAddFresh.length - 1 ? `1px solid ${C.hairSoft}` : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: C.turk }} />
                    <span style={{ flex: 1 }}>{f.text}</span>
                    {f.sources.size > 1 && (
                      <span style={{
                        fontSize: 10.5, color: C.ink3, fontWeight: 600,
                        background: C.hairSoft, padding: '2px 6px', borderRadius: 4,
                      }}>×{f.sources.size}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: C.ink2 }}>
              Tällä viikolla ei ole vielä arvottuja aterioita.
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px 22px', borderTop: `1px solid ${C.hair}`, background: '#fff', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            height: 50, padding: '0 16px', borderRadius: 14,
            background: '#fff', color: C.ink2, border: `1.5px solid ${C.hair}`,
            fontWeight: 600, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer',
          }}>Peru</button>
          <button onClick={() => onConfirm([...toAddFresh, ...toAddPantry])}
            disabled={totalAdd === 0}
            style={{
              flex: 1, height: 50, borderRadius: 14, border: 'none',
              background: totalAdd === 0 ? '#D8E1E3' : C.turk,
              color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'inherit',
              cursor: totalAdd === 0 ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: totalAdd === 0 ? 'none' : `0 8px 18px ${C.turk}55`,
            }}>
            <Icon name="plus" size={18} stroke={2.4} /> Lisää {totalAdd > 0 ? `(${totalAdd})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingScreen({ items, onToggle, onRemove, onClearChecked, onClearAll, onOpenAdd, hasPlan }) {
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: -0.8 }}>Ostoslista</div>
        <div style={{ fontSize: 14, color: C.ink2, marginTop: 4, fontWeight: 500 }}>
          {items.length === 0 ? 'Lista on tyhjä' : `${unchecked.length} ostettavaa · ${checked.length} kerätty`}
        </div>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <button onClick={onOpenAdd} disabled={!hasPlan} style={{
          width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: hasPlan ? C.turk : '#D8E1E3',
          color: '#fff', fontWeight: 700, fontSize: 15.5, fontFamily: 'inherit',
          cursor: hasPlan ? 'pointer' : 'default',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: hasPlan ? `0 8px 18px ${C.turk}44` : 'none',
        }}>
          <Icon name="plus" size={18} stroke={2.4} />
          Lisää viikon ainekset
        </button>
        {!hasPlan && (
          <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 8, textAlign: 'center' }}>
            Arvo ensin aterioita kuluvalle viikolle.
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyShopping />
      ) : (
        <>
          <div style={{ padding: '0 16px' }}>
            {unchecked.length > 0 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 4px 8px' }}>
                Ostettavaa · {unchecked.length}
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.hair}`, overflow: 'hidden' }}>
              {unchecked.map((it, i) => (
                <ShopRow key={it.id} item={it} last={i === unchecked.length - 1} onToggle={onToggle} onRemove={onRemove} />
              ))}
              {unchecked.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: C.ink2, fontSize: 13.5 }}>
                  Kaikki kerätty!
                </div>
              )}
            </div>
          </div>

          {checked.length > 0 && (
            <div style={{ padding: '0 16px', marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 8px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Kerätty · {checked.length}
                </div>
                <button onClick={onClearChecked} style={{
                  background: 'transparent', border: 'none', color: C.turkDeep,
                  fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', padding: 4,
                }}>Tyhjennä</button>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.hair}`, overflow: 'hidden', opacity: 0.78 }}>
                {checked.map((it, i) => (
                  <ShopRow key={it.id} item={it} last={i === checked.length - 1} onToggle={onToggle} onRemove={onRemove} />
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '18px 16px 0', textAlign: 'center' }}>
            <button onClick={onClearAll} style={{
              background: 'transparent', border: 'none', color: C.ink3,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: 6,
            }}>
              <Icon name="trash" size={13} /> Tyhjennä koko lista
            </button>
          </div>
        </>
      )}
    </div>
  );
}
