import { useState, useEffect, useRef, useMemo } from 'react';
import { C, SLOTS, TWEAK_DEFAULTS, DEFAULT_PREFS } from './constants.js';
import { loadState, saveState, mondayOf, weekKey, buildPool, computeWeights, weightedPick } from './utils.js';
import { DEFAULT_RECIPES } from './data/recipes.js';
import AndroidDevice from './components/android/AndroidDevice.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import WeekScreen from './components/WeekScreen.jsx';
import ShoppingScreen, { AddToShoppingSheet } from './components/ShoppingScreen.jsx';
import RecipesScreen, { AddSheet } from './components/RecipesScreen.jsx';
import RecipeSheet from './components/RecipeSheet.jsx';
import PreferencesSheet from './components/PreferencesSheet.jsx';
import SearchSheet from './components/SearchSheet.jsx';
import Icon from './components/Icon.jsx';

function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'koti',     label: 'Koti',     icon: 'home' },
    { id: 'ostokset', label: 'Ostokset', icon: 'cart' },
    { id: 'reseptit', label: 'Reseptit', icon: 'book' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 22, zIndex: 40,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: 22, padding: 6,
      display: 'flex', gap: 4,
      boxShadow: '0 -2px 6px rgba(15,42,46,0.04), 0 12px 30px rgba(15,42,46,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {tabs.map(t => {
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
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
  const [tab, setTab] = useState('koti');
  const [tweaks] = useState(TWEAK_DEFAULTS);

  const [recipes, setRecipes] = useState(() => {
    const s = loadState();
    const custom = s?.customRecipes || [];
    return [...DEFAULT_RECIPES, ...custom];
  });

  const [weeks, setWeeks] = useState(() => {
    const s = loadState();
    if (s?.plan && !s?.weeks) {
      const k = weekKey(mondayOf(new Date()));
      return { [k]: s.plan };
    }
    return s?.weeks || {};
  });

  const [shopping, setShopping] = useState(() => loadState()?.shopping || []);
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...(loadState()?.prefs || {}) }));

  const [selectedMonday, setSelectedMonday] = useState(null);

  const [rolling, setRolling] = useState(null);
  const [rollNames, setRollNames] = useState({});
  const [openKey, setOpenKey] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [addShoppingOpen, setAddShoppingOpen] = useState(false);
  const rollTimer = useRef(null);

  useEffect(() => {
    saveState({ weeks, shopping, customRecipes: recipes.filter(r => r.custom), prefs });
  }, [weeks, shopping, recipes, prefs]);

  const activeKey = selectedMonday ? weekKey(selectedMonday) : null;
  const plan = activeKey ? (weeks[activeKey] || {}) : {};

  const setPlan = (updater) => {
    if (!activeKey) return;
    setWeeks(prev => ({
      ...prev,
      [activeKey]: typeof updater === 'function' ? updater(prev[activeKey] || {}) : updater,
    }));
  };

  const currentMon = mondayOf(new Date());
  const currentKey = weekKey(currentMon);
  const currentPlan = weeks[currentKey] || {};
  const hasPlan = Object.values(currentPlan).some(e => e && (e.status === 'locked' || e.status === 'pending'));

  const usedBySlot = useMemo(() => {
    const m = { lounas: new Set(), paivallinen: new Set() };
    Object.entries(plan).forEach(([k, v]) => {
      if (!v) return;
      const slot = k.split('-')[1];
      if (m[slot]) m[slot].add(v.id);
    });
    return m;
  }, [plan]);

  const arvoOne = (idx, slot) => {
    const key = `${idx}-${slot}`;
    if (rolling) return;
    const current = plan[key];
    const exclude = new Set([...(usedBySlot[slot] || [])]);
    if (current) exclude.add(current.id);
    const pool = buildPool(recipes, slot, prefs, exclude);
    if (pool.length === 0) return;
    const weights = computeWeights(pool, prefs);
    const winner = weightedPick(pool, weights) || pool[0];

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
      if (v?.status === 'locked') used[k.split('-')[1]]?.add(v.id);
    });
    for (let i = 0; i < 7; i++) {
      for (const s of SLOTS) {
        const key = `${i}-${s.id}`;
        if (newPlan[key]?.status === 'locked') continue;
        const pool = buildPool(recipes, s.id, prefs, used[s.id] || new Set());
        if (pool.length === 0) continue;
        const weights = computeWeights(pool, prefs);
        const w = weightedPick(pool, weights) || pool[0];
        newPlan[key] = { id: w.id, status: 'pending' };
        used[s.id].add(w.id);
      }
    }
    setPlan(newPlan);
  };

  const acceptAll = () => {
    setPlan(prev => {
      const np = { ...prev };
      Object.keys(np).forEach(k => { if (np[k]?.status === 'pending') np[k] = { ...np[k], status: 'locked' }; });
      return np;
    });
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

  const handleSearchSave = recipe => {
    setRecipes(prev => [recipe, ...prev]);
    setSearchOpen(false);
  };

  const handleShoppingConfirm = (items) => {
    const newItems = items.map(it => ({
      id: 'sh' + Date.now() + Math.random(),
      key: it.key,
      text: it.text,
      name: it.name,
      qtyLabel: it.qtyLabel,
      sources: it.sources ? [...it.sources] : [],
      checked: false,
    }));
    setShopping(prev => [...prev, ...newItems]);
    setAddShoppingOpen(false);
  };

  const handleAddToShopping = () => {
    setAddShoppingOpen(true);
  };

  const handlePickWeek = (monday) => {
    setSelectedMonday(monday);
  };

  const handleBack = () => {
    setSelectedMonday(null);
  };

  const showHome = tab === 'koti' && !selectedMonday;
  const showWeek = tab === 'koti' && !!selectedMonday;

  return (
    <AndroidDevice width={412} height={892}>
      <div style={{ height: '100%', overflow: 'auto', background: C.bg, paddingTop: 4, position: 'relative' }}>
        {showHome && (
          <HomeScreen
            weeks={weeks}
            recipes={recipes}
            family={tweaks.family}
            prefs={prefs}
            onPickWeek={handlePickWeek}
            onOpenPrefs={() => setPrefsOpen(true)}
          />
        )}

        {showWeek && (
          <WeekScreen
            plan={plan}
            recipes={recipes}
            rolling={rolling}
            rollNames={rollNames}
            onArvo={arvoOne}
            onOpen={(idx, slot) => setOpenKey(`${idx}-${slot}`)}
            onArvoAll={arvoAll}
            onAcceptAll={acceptAll}
            onClear={clearAll}
            family={tweaks.family}
            monday={selectedMonday}
            onBack={handleBack}
            onAddToShopping={handleAddToShopping}
          />
        )}

        {tab === 'ostokset' && (
          <ShoppingScreen
            items={shopping}
            hasPlan={hasPlan}
            onToggle={id => setShopping(prev => prev.map(it => it.id === id ? { ...it, checked: !it.checked } : it))}
            onRemove={id => setShopping(prev => prev.filter(it => it.id !== id))}
            onClearChecked={() => setShopping(prev => prev.filter(it => !it.checked))}
            onClearAll={() => setShopping([])}
            onOpenAdd={() => setAddShoppingOpen(true)}
          />
        )}

        {tab === 'reseptit' && (
          <RecipesScreen
            recipes={recipes}
            onOpen={id => setOpenKey(`browse-${id}`)}
            onAdd={() => setAddOpen(true)}
            onSearch={() => setSearchOpen(true)}
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

        <AddSheet open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} />
        <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} onSave={handleSearchSave} />
        <PreferencesSheet
          open={prefsOpen}
          onClose={() => setPrefsOpen(false)}
          prefs={prefs}
          onChange={setPrefs}
          recipes={recipes}
        />
        <AddToShoppingSheet
          open={addShoppingOpen}
          plan={weeks[currentKey] || {}}
          recipes={recipes}
          existing={shopping}
          eaters={prefs.eaters}
          onClose={() => setAddShoppingOpen(false)}
          onConfirm={handleShoppingConfirm}
        />

        <TabBar tab={tab} setTab={id => { setTab(id); if (id !== 'koti') setSelectedMonday(null); }} />
      </div>
    </AndroidDevice>
  );
}
