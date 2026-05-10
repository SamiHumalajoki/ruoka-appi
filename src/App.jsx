import { useState, useEffect, useRef, useMemo } from 'react';
import { C, SLOTS, TWEAK_DEFAULTS } from './constants.js';
import { loadState, saveState, pickRandom } from './utils.js';
import { DEFAULT_RECIPES } from './data/recipes.js';
import IOSDevice from './components/ios/IOSDevice.jsx';
import WeekScreen from './components/WeekScreen.jsx';
import RecipesScreen, { AddSheet } from './components/RecipesScreen.jsx';
import RecipeSheet from './components/RecipeSheet.jsx';
import Icon from './components/Icon.jsx';

function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'viikko',   label: 'Viikko',   icon: 'home' },
    { id: 'reseptit', label: 'Reseptit', icon: 'book' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 22, zIndex: 40,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: 22, padding: 6,
      display: 'flex', gap: 4,
      boxShadow: '0 -2px 6px rgba(15,42,46,0.04), 0 12px 30px rgba(15,42,46,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {tabs.map(t => {
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" style={{
            flex: 1, height: 52, borderRadius: 17,
            background: on ? C.turkSoft : 'transparent', border: 'none',
            color: on ? C.turkDark : C.ink3, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            fontSize: 11.5, fontWeight: 700, letterSpacing: 0.2,
          }}>
            <Icon name={t.icon} size={20} stroke={on ? 2.2 : 1.8} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('viikko');
  const [tweaks] = useState(TWEAK_DEFAULTS);
  const [recipes, setRecipes] = useState(() => {
    const s = loadState();
    const custom = s?.customRecipes || [];
    return [...DEFAULT_RECIPES, ...custom];
  });
  const [plan, setPlan] = useState(() => loadState()?.plan || {});
  const [rolling, setRolling] = useState(null);
  const [rollNames, setRollNames] = useState({});
  const [openKey, setOpenKey] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const rollTimer = useRef(null);

  useEffect(() => {
    saveState({ plan, customRecipes: recipes.filter(r => r.custom) });
  }, [plan, recipes]);

  const usedBySlot = useMemo(() => {
    const m = { lounas: new Set(), paivallinen: new Set() };
    Object.entries(plan).forEach(([k, v]) => {
      if (!v) return;
      const slot = k.split('-')[1];
      if (m[slot]) m[slot].add(v.id);
    });
    return m;
  }, [plan]);

  const eligibleFor = (slot, exclude = new Set()) => {
    const ex = new Set([...exclude, ...usedBySlot[slot]]);
    return recipes.filter(r => r.slots.includes(slot) && !ex.has(r.id));
  };

  const arvoOne = (idx, slot) => {
    const key = `${idx}-${slot}`;
    if (rolling) return;
    const current = plan[key];
    const exclude = new Set();
    if (current) exclude.add(current.id);
    const pool = eligibleFor(slot, exclude);
    if (pool.length === 0) return;
    const winner = pickRandom(pool);

    setRolling(key);
    const namePool = pool.length > 1 ? pool : recipes.filter(r => r.slots.includes(slot));
    rollTimer.current = setInterval(() => {
      const r = namePool[Math.floor(Math.random() * namePool.length)];
      setRollNames(prev => ({ ...prev, [key]: r.name }));
    }, 80);
    setTimeout(() => {
      clearInterval(rollTimer.current);
      setRollNames(prev => ({ ...prev, [key]: winner.name }));
      setPlan(prev => ({ ...prev, [key]: { id: winner.id, status: 'pending' } }));
      setRolling(null);
    }, 900);
  };

  const arvoAll = () => {
    const newPlan = { ...plan };
    const used = { lounas: new Set(), paivallinen: new Set() };
    Object.entries(plan).forEach(([k, v]) => {
      if (v && v.status === 'locked') used[k.split('-')[1]].add(v.id);
    });
    for (let i = 0; i < 7; i++) {
      for (const s of SLOTS) {
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

  const acceptOne = key => {
    setPlan(prev => prev[key] ? ({ ...prev, [key]: { ...prev[key], status: 'locked' } }) : prev);
    setOpenKey(null);
  };

  const rerollOne = key => {
    const [idx, slot] = key.split('-');
    setOpenKey(null);
    setTimeout(() => arvoOne(parseInt(idx), slot), 250);
  };

  const unlockOne = key => {
    setPlan(prev => prev[key] ? ({ ...prev, [key]: { ...prev[key], status: 'pending' } }) : prev);
    setOpenKey(null);
    const [idx, slot] = key.split('-');
    setTimeout(() => arvoOne(parseInt(idx), slot), 250);
  };

  const clearOne = key => {
    setPlan(prev => { const np = { ...prev }; delete np[key]; return np; });
    setOpenKey(null);
  };

  const modal = useMemo(() => {
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

  const handleAdd = recipe => {
    setRecipes(prev => [recipe, ...prev]);
    setAddOpen(false);
  };

  return (
    <IOSDevice width={402} height={874}>
      <div style={{ height: '100%', background: C.bg, position: 'relative' }}>
        <div style={{ height: '100%', overflow: 'auto', paddingTop: 16, paddingBottom: 88 }}>
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
              onOpen={id => setOpenKey(`browse-${id}`)}
              onAdd={() => setAddOpen(true)}
            />
          )}
        </div>

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
        <AddSheet open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} />

        <TabBar tab={tab} setTab={setTab} />
      </div>
    </IOSDevice>
  );
}
