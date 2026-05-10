import { useMemo } from 'react';
import { C, DAYS, SLOTS } from '../constants.js';
import { mondayOf, isoWeek, dateAt, rangeLabel } from '../utils.js';
import Icon from './Icon.jsx';
import Badge from './Badge.jsx';

function MealRow({ slot, recipe, status, onArvo, onOpen, rolling, rollName }) {
  const isPending = status === 'pending';
  const isEmpty = status === 'empty';
  const isLocked = status === 'locked';
  const slotMeta = SLOTS.find(s => s.id === slot);
  return (
    <div
      onClick={!isEmpty && !rolling ? onOpen : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 14,
        background: isPending ? C.coralLite + '99' : isLocked ? C.turkSoft : '#fff',
        border: `1.5px solid ${isPending ? C.coral + '55' : isLocked ? C.turkLite : C.hair}`,
        cursor: !isEmpty && !rolling ? 'pointer' : 'default',
        transition: 'background 200ms ease, border-color 200ms ease',
        minHeight: 64,
      }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: slot === 'lounas' ? C.amberLite : '#E6E9F4',
        color: slot === 'lounas' ? '#9C6A0A' : '#3F4985',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={slotMeta.icon} size={16} />
      </div>

      {isEmpty ? (
        <>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {slotMeta.label}
            </div>
            <div style={{ fontSize: 15, color: C.ink2, marginTop: 2 }}>Ei vielä arvottu</div>
          </div>
          <button onClick={e => { e.stopPropagation(); onArvo(); }} style={{
            height: 36, padding: '0 14px', borderRadius: 11,
            background: C.coral, color: '#fff', border: 'none',
            fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: `0 4px 10px ${C.coral}44`,
          }}>
            <Icon name="dice" size={15} /> Arvo
          </button>
        </>
      ) : rolling ? (
        <>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.coral}, ${C.amber})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'rospin 0.4s linear infinite',
          }}>
            <Icon name="dice" size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.coralDeep, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {slotMeta.label} · arvotaan
            </div>
            <div style={{ fontSize: 15, color: C.ink, marginTop: 2, fontWeight: 600, opacity: 0.8 }}>
              {rollName || '…'}
            </div>
          </div>
        </>
      ) : (
        <>
          <Badge recipe={recipe} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: isPending ? C.coralDeep : C.ink3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {slotMeta.label}
              </span>
              {isPending && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#fff', background: C.coral,
                  padding: '2px 6px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase',
                }}>ehdotus</span>
              )}
            </div>
            <div style={{
              fontSize: 16, color: C.ink, fontWeight: 600, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: -0.2,
            }}>{recipe?.name}</div>
            <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={11} /> {recipe?.time} min
            </div>
          </div>
          <Icon name="chev" size={16} color={C.ink3} />
        </>
      )}
    </div>
  );
}

function DayCard({ idx, day, date, isToday, plan, recipes, rolling, rollNames, onArvo, onOpen }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 22,
      padding: 14, marginBottom: 12,
      boxShadow: isToday
        ? `0 0 0 2px ${C.turk}, 0 8px 22px ${C.turk}22`
        : '0 1px 0 rgba(15,42,46,0.04), 0 8px 22px rgba(15,42,46,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '2px 4px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>{day.full}</span>
          {isToday && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fff', background: C.turk,
              padding: '2px 7px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>tänään</span>
          )}
        </div>
        <span style={{ fontSize: 13, color: C.ink3, fontWeight: 500 }}>
          {date.getDate()}.{date.getMonth() + 1}.
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SLOTS.map(s => {
          const key = `${idx}-${s.id}`;
          const entry = plan[key];
          const recipe = entry ? recipes.find(r => r.id === entry.id) : null;
          const status = !entry ? 'empty' : entry.status;
          const r = rolling === key;
          return (
            <MealRow key={s.id}
              slot={s.id} recipe={recipe} status={status}
              rolling={r} rollName={rollNames[key]}
              onArvo={() => onArvo(idx, s.id)}
              onOpen={() => onOpen(idx, s.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function HeroCard({ stats, onArvoAll, onAcceptAll, onClear }) {
  const { empty, pending, locked, total } = stats;
  return (
    <div style={{
      margin: '0 16px 14px', borderRadius: 22, padding: 18,
      background: `linear-gradient(135deg, ${C.turk} 0%, ${C.turkDeep} 60%, ${C.turkDark} 100%)`,
      color: '#fff', position: 'relative', overflow: 'hidden',
      boxShadow: `0 16px 32px ${C.turk}33`,
    }}>
      <svg style={{ position: 'absolute', top: -30, right: -30, opacity: 0.18 }} width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="80" fill="none" stroke="#fff" strokeWidth="1"/>
        <circle cx="90" cy="90" r="55" fill="none" stroke="#fff" strokeWidth="1"/>
        <circle cx="90" cy="90" r="30" fill="none" stroke="#fff" strokeWidth="1"/>
      </svg>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.82, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Viikon arvonta
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.5 }}>
              {empty === total ? 'Aloitetaan viikko' :
                pending > 0 ? `${pending} ehdotus${pending === 1 ? '' : 'ta'} odottaa` :
                  empty === 0 ? 'Viikko on valmis' : `${empty} ateria${empty === 1 ? 'a' : 'a'} jäljellä`}
            </div>
          </div>
          <div style={{ position: 'relative', width: 50, height: 50 }}>
            <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none"/>
              <circle cx="25" cy="25" r="20" stroke="#fff" strokeWidth="4" fill="none"
                strokeDasharray={`${(locked / total) * 125.6} 125.6`} strokeLinecap="round"/>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>{locked}/{total}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onArvoAll} disabled={empty + pending === 0} style={{
            flex: 1, height: 48, borderRadius: 14, border: 'none',
            background: empty + pending === 0 ? 'rgba(255,255,255,0.18)' : '#fff',
            color: empty + pending === 0 ? 'rgba(255,255,255,0.6)' : C.turkDark,
            fontWeight: 700, fontSize: 15.5, fontFamily: 'inherit',
            cursor: empty + pending === 0 ? 'default' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="dice" size={18} />
            {empty === total ? 'Arvo koko viikko' : empty + pending === total ? 'Arvo loput' : 'Arvo tyhjät'}
          </button>
          {pending > 0 && (
            <button onClick={onAcceptAll} style={{
              height: 48, padding: '0 14px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.45)',
              background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14,
              fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="check" size={16} /> Hyväksy {pending}
            </button>
          )}
        </div>

        {locked + pending > 0 && (
          <button onClick={onClear} style={{
            marginTop: 10, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.78)',
            fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4,
          }}>
            <Icon name="broom" size={13} /> Aloita uusi viikko
          </button>
        )}
      </div>
    </div>
  );
}

export default function WeekScreen({ plan, recipes, rolling, rollNames, onArvo, onOpen, onArvoAll, onAcceptAll, onClear, family }) {
  const today = new Date();
  const monday = mondayOf(today);
  const todayIdx = (today.getDay() + 6) % 7;

  const stats = useMemo(() => {
    let empty = 0, pending = 0, locked = 0;
    const total = 14;
    for (let i = 0; i < 7; i++) {
      for (const s of SLOTS) {
        const e = plan[`${i}-${s.id}`];
        if (!e) empty++;
        else if (e.status === 'pending') pending++;
        else locked++;
      }
    }
    return { empty, pending, locked, total };
  }, [plan]);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '8px 22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.turkDeep, fontWeight: 600, fontSize: 13, letterSpacing: 0.4 }}>
          <Icon name="users" size={14} /> {family}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 4, letterSpacing: -0.8, lineHeight: 1.05 }}>
          Viikon ruoat
        </div>
        <div style={{ fontSize: 14, color: C.ink2, marginTop: 4, fontWeight: 500 }}>
          Viikko {isoWeek(monday)} · {rangeLabel(monday)}
        </div>
      </div>

      <HeroCard stats={stats} onArvoAll={onArvoAll} onAcceptAll={onAcceptAll} onClear={onClear} />

      <div style={{ padding: '0 16px' }}>
        {DAYS.map((day, idx) => (
          <DayCard key={idx}
            idx={idx} day={day} date={dateAt(monday, idx)}
            isToday={idx === todayIdx}
            plan={plan} recipes={recipes}
            rolling={rolling} rollNames={rollNames}
            onArvo={onArvo} onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
