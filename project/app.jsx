// Pääsovellus — tila, tabit, arvonta, tweaks
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

const STORAGE_KEY = 'ruoka-appi-v1';
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#14B8A6",
  "accent": "#FFC0CB",
  "family": "Virtaset",
  "compact": false,
  "showWeekend": true
}/*EDITMODE-END*/;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function pickRandom(pool, exclude = new Set()) {
  const candidates = pool.filter(r => !exclude.has(r.id));
  if (candidates.length === 0) return pool[Math.floor(Math.random()*pool.length)];
  return candidates[Math.floor(Math.random()*candidates.length)];
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useStateA('viikko');
  const [recipes, setRecipes] = useStateA(() => {
    const s = loadState();
    const custom = s?.customRecipes || [];
    return [...DEFAULT_RECIPES, ...custom];
  });
  const [plan, setPlan] = useStateA(() => loadState()?.plan || {});
  const [rolling, setRolling] = useStateA(null);     // key being arvotted right now
  const [rollNames, setRollNames] = useStateA({});   // visual cycling names
  const [openKey, setOpenKey] = useStateA(null);     // 'idx-slot' or 'browse-id'
  const [addOpen, setAddOpen] = useStateA(false);
  const rollTimer = useRefA(null);

  // persist
  useEffectA(() => {
    saveState({
      plan,
      customRecipes: recipes.filter(r => r.custom),
    });
  }, [plan, recipes]);

  // current week's used ids (avoid duplicates per slot type within the week)
  const usedBySlot = useMemoA(() => {
    const m = { lounas: new Set(), paivallinen: new Set() };
    Object.entries(plan).forEach(([k, v]) => {
      if (!v) return;
      const slot = k.split('-')[1];
      m[slot] && m[slot].add(v.id);
    });
    return m;
  }, [plan]);

  const eligibleFor = (slot, exclude = new Set()) => {
    const ex = new Set([...exclude, ...usedBySlot[slot]]);
    return recipes.filter(r => r.slots.includes(slot) && !ex.has(r.id));
  };

  // ── Arvonta yhdelle paikalle ─────────────────────────────
  const arvoOne = (idx, slot) => {
    const key = `${idx}-${slot}`;
    if (rolling) return;
    const current = plan[key];
    const exclude = new Set();
    if (current) exclude.add(current.id);
    const pool = eligibleFor(slot, exclude);
    if (pool.length === 0) return;
    const winner = pickRandom(pool);

    // remove current entry from used set during spin so cycling can use names broadly
    setRolling(key);
    let i = 0;
    const namePool = pool.length > 1 ? pool : recipes.filter(r => r.slots.includes(slot));
    rollTimer.current = setInterval(() => {
      const r = namePool[Math.floor(Math.random()*namePool.length)];
      setRollNames(prev => ({ ...prev, [key]: r.name }));
      i++;
    }, 80);
    setTimeout(() => {
      clearInterval(rollTimer.current);
      setRollNames(prev => ({ ...prev, [key]: winner.name }));
      setPlan(prev => ({ ...prev, [key]: { id: winner.id, status: 'pending' } }));
      setRolling(null);
    }, 900);
  };

  // ── Arvo koko viikko (vain tyhjät / pending) ─────────────
  const arvoAll = () => {
    const newPlan = { ...plan };
    const used = { lounas: new Set(), paivallinen: new Set() };
    // lukitut säilyvät ja varaavat slotin
    Object.entries(plan).forEach(([k, v]) => {
      if (v && v.status === 'locked') used[k.split('-')[1]].add(v.id);
    });
    for (let i = 0; i < 7; i++) {
      for (const s of RU.SLOTS) {
        const key = `${i}-${s.id}`;
        if (newPlan[key]?.status === 'locked') continue;
        const pool = recipes.filter(r => r.slots.includes(s.id) && !used[s.id].has(r.id));
        if (pool.length === 0) continue;
        const w = pickRandom(pool);
        newPlan[key] = { id: w.id, status: 'pending' };
        used[s.id].add(w.id);
      }
    }
    setPlan(newPlan);
  };

  const acceptAll = () => {
    const np = { ...plan };
    Object.keys(np).forEach(k => { if (np[k].status === 'pending') np[k] = { ...np[k], status: 'locked' }; });
    setPlan(np);
  };
  const clearAll = () => setPlan({});

  const acceptOne = (key) => {
    setPlan(prev => prev[key] ? ({ ...prev, [key]: { ...prev[key], status: 'locked' } }) : prev);
    setOpenKey(null);
  };
  const rerollOne = (key) => {
    const [idx, slot] = key.split('-');
    setOpenKey(null);
    setTimeout(() => arvoOne(parseInt(idx), slot), 250);
  };
  const unlockOne = (key) => {
    setPlan(prev => prev[key] ? ({ ...prev, [key]: { ...prev[key], status: 'pending' } }) : prev);
    setOpenKey(null);
    const [idx, slot] = key.split('-');
    setTimeout(() => arvoOne(parseInt(idx), slot), 250);
  };
  const clearOne = (key) => {
    setPlan(prev => { const np = { ...prev }; delete np[key]; return np; });
    setOpenKey(null);
  };

  // ── Modal payload ───────────────────────────────────────
  const modal = useMemoA(() => {
    if (!openKey) return null;
    if (openKey.startsWith('browse-')) {
      const id = openKey.slice(7);
      const r = recipes.find(x => x.id === id);
      return r ? { recipe: r, status: 'browse' } : null;
    }
    const e = plan[openKey];
    if (!e) return null;
    const r = recipes.find(x => x.id === e.id);
    return r ? { recipe: r, status: e.status, key: openKey } : null;
  }, [openKey, plan, recipes]);

  const handleAdd = (recipe) => {
    setRecipes(prev => [recipe, ...prev]);
    setAddOpen(false);
  };

  // theme override via tweaks
  useEffectA(() => {
    document.documentElement.style.setProperty('--ru-primary', tweaks.primary);
    document.documentElement.style.setProperty('--ru-accent', tweaks.accent);
  }, [tweaks.primary, tweaks.accent]);

  return (
    <>
      <IOSDevice width={402} height={874}>
        <div style={{
          height: '100%', overflow:'auto', background: RU.C.bg,
          paddingTop: 56, position:'relative',
        }}>
          {tab === 'viikko' && (
            <WeekScreen
              plan={plan} recipes={recipes}
              rolling={rolling} rollNames={rollNames}
              onArvo={arvoOne}
              onOpen={(idx, slot) => setOpenKey(`${idx}-${slot}`)}
              onArvoAll={arvoAll} onAcceptAll={acceptAll} onClear={clearAll}
              family={tweaks.family}
            />
          )}
          {tab === 'reseptit' && (
            <RecipesScreen
              recipes={recipes}
              onOpen={(id) => setOpenKey(`browse-${id}`)}
              onAdd={() => setAddOpen(true)}
            />
          )}

          <RecipeSheet
            open={!!modal}
            recipe={modal?.recipe}
            status={modal?.status}
            onClose={() => setOpenKey(null)}
            onAccept={() => acceptOne(modal.key)}
            onReroll={() => rerollOne(modal.key)}
            onUnlock={() => unlockOne(modal.key)}
            onClear={() => clearOne(modal.key)}
          />
          <AddSheet open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd}/>

          <TabBar tab={tab} setTab={setTab}/>
        </div>
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Värimaailma">
          <TweakColor
            label="Pääväri"
            value={tweaks.primary}
            options={['#14B8A6','#0E867A','#06B6D4','#0EA5A8','#10A39B']}
            onChange={(v) => setTweak('primary', v)}
          />
          <TweakColor
            label="Aksentti"
            value={tweaks.accent}
            options={['#FF7A59','#F4B740','#EC4899','#8B5CF6']}
            onChange={(v) => setTweak('accent', v)}
          />
        </TweakSection>
        <TweakSection label="Perhe">
          <TweakText label="Perheen nimi" value={tweaks.family} onChange={(v)=>setTweak('family', v)}/>
        </TweakSection>
        <TweakSection label="Toiminnot">
          <TweakButton label="Arvo koko viikko" onClick={arvoAll}/>
          <TweakButton label="Tyhjennä viikko" secondary onClick={clearAll}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function TabBar({ tab, setTab }) {
  const tabs = [
    { id:'viikko',   label:'Viikko',   icon:'home' },
    { id:'reseptit', label:'Reseptit', icon:'book' },
  ];
  return (
    <div style={{
      position:'absolute', left: 12, right: 12, bottom: 22, zIndex: 40,
      background:'rgba(255,255,255,0.85)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      borderRadius: 22, padding: 6,
      display:'flex', gap: 4,
      boxShadow: '0 -2px 6px rgba(15,42,46,0.04), 0 12px 30px rgba(15,42,46,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {tabs.map(t => {
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex: 1, height: 52, borderRadius: 17,
            background: on ? RU.C.turkSoft : 'transparent', border:'none',
            color: on ? RU.C.turkDark : RU.C.ink3, cursor:'pointer', fontFamily:'inherit',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 2,
            fontSize: 11.5, fontWeight: 700, letterSpacing: 0.2,
          }}>
            <RU.Icon name={t.icon} size={20} stroke={on ? 2.2 : 1.8}/>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
