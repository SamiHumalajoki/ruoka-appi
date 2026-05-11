import { useMemo } from 'react';
import { C, SLOTS, MONTHS_FULL } from '../constants.js';
import { isoWeek, rangeLabel, dateAt, mondayOf, weekKey } from '../utils.js';
import Icon from './Icon.jsx';
import Badge from './Badge.jsx';

function weekStats(plan) {
  let empty = 0, pending = 0, locked = 0;
  for (let i = 0; i < 7; i++) {
    for (const s of SLOTS) {
      const e = plan?.[`${i}-${s.id}`];
      if (!e) empty++;
      else if (e.status === 'pending') pending++;
      else locked++;
    }
  }
  return { empty, pending, locked, total: 14 };
}

function WeekTile({ monday, isCurrent, isPast, plan, recipes, onPick }) {
  const stats = weekStats(plan);
  const filled = stats.locked + stats.pending;
  const pct = filled / stats.total;
  const wk = isoWeek(monday);
  const range = rangeLabel(monday);

  const sample = [];
  if (plan) {
    for (let i = 0; i < 7 && sample.length < 5; i++) {
      for (const s of SLOTS) {
        const e = plan[`${i}-${s.id}`];
        if (!e) continue;
        const r = recipes.find(x => x.id === e.id);
        if (r && !sample.find(x => x.id === r.id)) sample.push(r);
        if (sample.length >= 5) break;
      }
    }
  }

  return (
    <button onClick={onPick} style={{
      display: 'block', width: '100%', textAlign: 'left',
      background: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
      border: isCurrent ? `2px solid ${C.turk}` : `1px solid ${C.hair}`,
      boxShadow: isCurrent
        ? `0 12px 28px ${C.turk}26, 0 1px 0 rgba(15,42,46,0.04)`
        : '0 1px 0 rgba(15,42,46,0.03), 0 4px 12px rgba(15,42,46,0.04)',
      fontFamily: 'inherit', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      opacity: isPast && filled === 0 ? 0.7 : 1,
    }}>
      {isCurrent && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: C.turk, color: '#fff',
          fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '0 16px 0 12px',
        }}>Kuluva viikko</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: isCurrent ? C.turkDeep : C.ink3,
            letterSpacing: 0.8, textTransform: 'uppercase',
          }}>Viikko {wk}</div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: C.ink, marginTop: 2,
            letterSpacing: -0.3, textTransform: 'capitalize',
          }}>{range}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
            fontSize: 12.5, color: C.ink2, fontWeight: 500,
          }}>
            {filled === 0 ? (
              <span style={{ color: isCurrent ? C.turkDeep : C.ink3 }}>Ei arvottuja aterioita</span>
            ) : stats.empty === 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.turkDeep, fontWeight: 600 }}>
                <Icon name="check" size={12} stroke={2.4} /> Viikko suunniteltu
              </span>
            ) : (
              <span>{filled}/{stats.total} ateriaa{stats.pending > 0 ? ` · ${stats.pending} ehdotusta` : ''}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {filled > 0 && (
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="20" cy="20" r="16" stroke={C.turkLite} strokeWidth="3.5" fill="none" />
                <circle cx="20" cy="20" r="16" stroke={C.turk} strokeWidth="3.5" fill="none"
                  strokeDasharray={`${pct * 100.5} 100.5`} strokeLinecap="round" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: C.turkDark, letterSpacing: -0.3,
              }}>{Math.round(pct * 100)}%</div>
            </div>
          )}
          <Icon name="chev" size={18} color={isCurrent ? C.turkDeep : C.ink3} />
        </div>
      </div>

      {sample.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {sample.map(r => <Badge key={r.id} recipe={r} size={28} radius={8} />)}
          {filled > sample.length && (
            <div style={{
              height: 28, padding: '0 8px', borderRadius: 8,
              background: C.turkSoft, color: C.turkDark,
              display: 'inline-flex', alignItems: 'center',
              fontSize: 11.5, fontWeight: 700, letterSpacing: -0.1,
            }}>+{filled - sample.length}</div>
          )}
        </div>
      )}
    </button>
  );
}

export default function HomeScreen({ weeks, recipes, family, prefs, onPickWeek, onOpenPrefs }) {
  const today = new Date();
  const currentMon = mondayOf(today);
  const currentKey = weekKey(currentMon);

  const list = useMemo(() => {
    const arr = [];
    for (let i = -1; i <= 10; i++) {
      const m = new Date(currentMon);
      m.setDate(m.getDate() + i * 7);
      arr.push(m);
    }
    return arr;
  }, [currentKey]);

  const groups = useMemo(() => {
    const gs = [];
    list.forEach(m => {
      const monthLabel = `${MONTHS_FULL[m.getMonth()]} ${m.getFullYear()}`;
      let g = gs.find(x => x.label === monthLabel);
      if (!g) { g = { label: monthLabel, items: [] }; gs.push(g); }
      g.items.push(m);
    });
    return gs;
  }, [list]);

  const currentStats = weekStats(weeks[currentKey] || {});

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '8px 20px 12px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: C.turkDeep, fontWeight: 600, fontSize: 13, letterSpacing: 0.4,
        }}>
          <Icon name="users" size={14} /> {family}
        </div>
        <div style={{
          fontSize: 30, fontWeight: 800, color: C.ink,
          marginTop: 4, letterSpacing: -0.8, lineHeight: 1.05,
        }}>Mille viikolla{' '}arvotaan?</div>
        <div style={{ fontSize: 14, color: C.ink2, marginTop: 6, fontWeight: 500 }}>
          Valitse viikko ja arvo perheen lounaat ja päivälliset.
        </div>
        <button onClick={onOpenPrefs} style={{
          marginTop: 12, height: 38, padding: '0 14px', borderRadius: 12,
          background: '#fff', color: C.turkDeep, border: `1.5px solid ${C.turkLite}`,
          fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: -0.1,
        }}>
          <Icon name="users" size={14} /> {prefs?.eaters || 4} syöjää · painotukset
        </button>
      </div>

      {/* highlighted current week */}
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={() => onPickWeek(currentMon)} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: 18, borderRadius: 22, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${C.turk} 0%, ${C.turkDeep} 60%, ${C.turkDark} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: `0 16px 32px ${C.turk}40`,
          fontFamily: 'inherit',
        }}>
          <svg style={{ position: 'absolute', top: -40, right: -40, opacity: 0.18 }} width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeWidth="1" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#fff" strokeWidth="1" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 6,
            }}>
              <Icon name="spark" size={12} color="#fff" /> Kuluva viikko
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10, letterSpacing: -0.6 }}>
              Viikko {isoWeek(currentMon)}
            </div>
            <div style={{ fontSize: 14, opacity: 0.92, marginTop: 2, textTransform: 'capitalize' }}>
              {rangeLabel(currentMon)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
              <div style={{ fontSize: 13.5, opacity: 0.92, fontWeight: 500 }}>
                {currentStats.empty === 14 ? 'Ei vielä arvottu' :
                  currentStats.empty === 0 ? 'Viikko suunniteltu ✓' :
                  `${currentStats.locked + currentStats.pending}/14 ateriaa`}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fff', color: C.turkDark,
                padding: '10px 16px', borderRadius: 14, fontWeight: 700, fontSize: 14.5,
              }}>
                Avaa viikko <Icon name="chev" size={16} color={C.turkDark} />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* grouped week list */}
      {groups.map(g => (
        <div key={g.label} style={{ padding: '0 16px' }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: C.ink3,
            letterSpacing: 0.8, textTransform: 'uppercase',
            padding: '10px 4px 8px',
          }}>{g.label}</div>
          {g.items.map(m => {
            const k = weekKey(m);
            if (k === currentKey) return null;
            const isPast = m < currentMon;
            return (
              <WeekTile key={k} monday={m}
                isCurrent={false} isPast={isPast}
                plan={weeks[k] || {}} recipes={recipes}
                onPick={() => onPickWeek(m)} />
            );
          })}
        </div>
      ))}
    </div>
  );
}
