// Viikkonäkymä — kortti per päivä, lounas + päivällinen.
const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

function MealRow({ slot, recipe, status, onArvo, onOpen, rolling, rollName }) {
  // status: 'empty' | 'pending' | 'locked'
  const isPending = status === 'pending';
  const isEmpty = status === 'empty';
  const isLocked = status === 'locked';
  const slotMeta = RU.SLOTS.find(s => s.id === slot);
  return (
    <div
      onClick={!isEmpty && !rolling ? onOpen : undefined}
      style={{
        display:'flex', alignItems:'center', gap: 12,
        padding: '10px 12px', borderRadius: 14,
        background: isPending ? RU.C.coralLite + '99' : isLocked ? RU.C.turkSoft : '#fff',
        border: `1.5px solid ${isPending ? RU.C.coral + '55' : isLocked ? RU.C.turkLite : RU.C.hair}`,
        cursor: !isEmpty && !rolling ? 'pointer' : 'default',
        transition:'background 200ms ease, border-color 200ms ease',
        minHeight: 64,
      }}>
      {/* slot ikoni vasemmalla */}
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: slot === 'lounas' ? RU.C.amberLite : '#E6E9F4',
        color: slot === 'lounas' ? '#9C6A0A' : '#3F4985',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
      }}>
        <RU.Icon name={slotMeta.icon} size={16} />
      </div>

      {/* sisältö */}
      {isEmpty ? (
        <>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: RU.C.ink3, fontWeight: 600, letterSpacing: 0.6, textTransform:'uppercase' }}>
              {slotMeta.label}
            </div>
            <div style={{ fontSize: 15, color: RU.C.ink2, marginTop: 2 }}>Ei vielä arvottu</div>
          </div>
          <button onClick={(e)=>{ e.stopPropagation(); onArvo(); }}
            style={{
              height: 36, padding:'0 14px', borderRadius: 11,
              background: RU.C.coral, color:'#fff', border:'none',
              fontWeight: 700, fontSize: 14, fontFamily:'inherit', cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap: 6,
              boxShadow: `0 4px 10px ${RU.C.coral}44`,
            }}>
            <RU.Icon name="dice" size={15}/> Arvo
          </button>
        </>
      ) : rolling ? (
        <>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${RU.C.coral}, ${RU.C.amber})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            animation: 'rospin 0.4s linear infinite',
          }}>
            <RU.Icon name="dice" size={22} color="#fff"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: RU.C.coralDeep, fontWeight: 700, letterSpacing: 0.6, textTransform:'uppercase' }}>
              {slotMeta.label} · arvotaan
            </div>
            <div style={{ fontSize: 15, color: RU.C.ink, marginTop: 2, fontWeight: 600, opacity: 0.8 }}>{rollName || '…'}</div>
          </div>
        </>
      ) : (
        <>
          <RU.Badge recipe={recipe}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: isPending ? RU.C.coralDeep : RU.C.ink3, fontWeight: 700, letterSpacing: 0.6, textTransform:'uppercase' }}>
                {slotMeta.label}
              </span>
              {isPending && <span style={{
                fontSize: 10, fontWeight: 700, color: '#fff', background: RU.C.coral,
                padding: '2px 6px', borderRadius: 4, letterSpacing: 0.4, textTransform:'uppercase',
              }}>ehdotus</span>}
            </div>
            <div style={{
              fontSize: 16, color: RU.C.ink, fontWeight: 600, marginTop: 2,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing: -0.2,
            }}>{recipe?.name}</div>
            <div style={{ fontSize: 12.5, color: RU.C.ink2, marginTop: 1, display:'flex', alignItems:'center', gap: 4 }}>
              <RU.Icon name="clock" size={11}/>{recipe?.time} min
            </div>
          </div>
          <RU.Icon name="chev" size={16} color={RU.C.ink3}/>
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
      boxShadow: isToday ? `0 0 0 2px ${RU.C.turk}, 0 8px 22px ${RU.C.turk}22` : '0 1px 0 rgba(15,42,46,0.04), 0 8px 22px rgba(15,42,46,0.05)',
    }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', padding:'2px 4px 10px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: RU.C.ink, letterSpacing: -0.3 }}>{day.full}</span>
          {isToday && <span style={{
            fontSize: 10, fontWeight: 700, color: '#fff', background: RU.C.turk,
            padding: '2px 7px', borderRadius: 4, letterSpacing: 0.4, textTransform:'uppercase',
          }}>tänään</span>}
        </div>
        <span style={{ fontSize: 13, color: RU.C.ink3, fontWeight: 500 }}>{date.getDate()}.{date.getMonth()+1}.</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
        {RU.SLOTS.map(s => {
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
      margin: '0 16px 14px',
      borderRadius: 22,
      padding: 18,
      background: `linear-gradient(135deg, ${RU.C.turk} 0%, ${RU.C.turkDeep} 60%, ${RU.C.turkDark} 100%)`,
      color: '#fff',
      position:'relative', overflow: 'hidden',
      boxShadow: `0 16px 32px ${RU.C.turk}33`,
    }}>
      {/* koristekuvio */}
      <svg style={{ position:'absolute', top:-30, right:-30, opacity: 0.18 }} width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="80" fill="none" stroke="#fff" strokeWidth="1"/>
        <circle cx="90" cy="90" r="55" fill="none" stroke="#fff" strokeWidth="1"/>
        <circle cx="90" cy="90" r="30" fill="none" stroke="#fff" strokeWidth="1"/>
      </svg>
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.82, fontWeight: 600, letterSpacing: 0.6, textTransform:'uppercase' }}>
              Viikon arvonta
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.5 }}>
              {empty === total ? 'Aloitetaan viikko' :
                pending > 0 ? `${pending} ehdotus${pending===1?'':'ta'} odottaa` :
                empty === 0 ? 'Viikko on valmis' : `${empty} ateria${empty===1?'a':'a'} jäljellä`}
            </div>
          </div>
          {/* progress ring */}
          <div style={{ position:'relative', width: 50, height: 50 }}>
            <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none"/>
              <circle cx="25" cy="25" r="20" stroke="#fff" strokeWidth="4" fill="none"
                strokeDasharray={`${(locked/total)*125.6} 125.6`} strokeLinecap="round"/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 13, fontWeight: 700 }}>{locked}/{total}</div>
          </div>
        </div>

        <div style={{ display:'flex', gap: 8 }}>
          <button onClick={onArvoAll} disabled={empty + pending === 0}
            style={{
              flex: 1, height: 48, borderRadius: 14, border:'none',
              background: empty + pending === 0 ? 'rgba(255,255,255,0.18)' : '#fff',
              color: empty + pending === 0 ? 'rgba(255,255,255,0.6)' : RU.C.turkDark,
              fontWeight: 700, fontSize: 15.5, fontFamily:'inherit',
              cursor: empty + pending === 0 ? 'default' : 'pointer',
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
            }}>
            <RU.Icon name="dice" size={18}/>
            {empty === total ? 'Arvo koko viikko' : empty + pending === total ? 'Arvo loput' : 'Arvo tyhjät'}
          </button>
          {pending > 0 && (
            <button onClick={onAcceptAll}
              style={{
                height: 48, padding:'0 14px', borderRadius: 14, border:'1.5px solid rgba(255,255,255,0.45)',
                background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14,
                fontFamily:'inherit', cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap: 6,
              }}>
              <RU.Icon name="check" size={16}/> Hyväksy {pending}
            </button>
          )}
        </div>

        {locked + pending > 0 && (
          <button onClick={onClear} style={{
            marginTop: 10, background:'transparent', border:'none', color:'rgba(255,255,255,0.78)',
            fontSize: 12.5, fontWeight: 500, fontFamily:'inherit', cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap: 4, padding: 4,
          }}>
            <RU.Icon name="broom" size={13}/> Aloita uusi viikko
          </button>
        )}
      </div>
    </div>
  );
}

function WeekScreen({ plan, recipes, rolling, rollNames, onArvo, onOpen, onArvoAll, onAcceptAll, onClear, family }) {
  const today = new Date();
  const monday = RU.mondayOf(today);
  const todayIdx = (today.getDay() + 6) % 7;

  // tilastot
  const stats = useMemo(() => {
    let empty = 0, pending = 0, locked = 0, total = 14;
    for (let i = 0; i < 7; i++) for (const s of RU.SLOTS) {
      const e = plan[`${i}-${s.id}`];
      if (!e) empty++;
      else if (e.status === 'pending') pending++;
      else locked++;
    }
    return { empty, pending, locked, total };
  }, [plan]);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* header */}
      <div style={{ padding: '8px 22px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, color: RU.C.turkDeep, fontWeight: 600, fontSize: 13, letterSpacing: 0.4 }}>
          <RU.Icon name="users" size={14}/> {family}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: RU.C.ink, marginTop: 4, letterSpacing: -0.8, lineHeight: 1.05 }}>
          Viikon ruoat
        </div>
        <div style={{ fontSize: 14, color: RU.C.ink2, marginTop: 4, fontWeight: 500 }}>
          Viikko {RU.isoWeek(monday)} · {RU.rangeLabel(monday)}
        </div>
      </div>

      <HeroCard stats={stats} onArvoAll={onArvoAll} onAcceptAll={onAcceptAll} onClear={onClear}/>

      <div style={{ padding: '0 16px' }}>
        {RU.DAYS.map((day, idx) => (
          <DayCard key={idx}
            idx={idx} day={day} date={RU.dateAt(monday, idx)}
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

window.WeekScreen = WeekScreen;
