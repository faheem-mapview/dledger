/* Daily Ledger — main app */
(function () {
  const { useState, useEffect, useMemo } = React;
  const Icon = window.Icon;
  const { DLCard, HabitsPanel, MoodPanel, WeekSpend } = window;
  const KIND = window.KIND;
  const fmtINR = window.fmtINR;

  /* ===================== Sidebar ===================== */
  function Sidebar() {
    const items = [
      { id: 'home', icon: 'home', label: 'Today' },
      { id: 'ledger', icon: 'ledger', label: 'Ledger' },
      { id: 'habits', icon: 'repeat', label: 'Habits' },
      { id: 'insights', icon: 'chart', label: 'Insights' },
      { id: 'calendar', icon: 'calendar', label: 'Calendar' },
    ];
    const [active, setActive] = useState('home');
    return (
      <nav style={{
        width: 74, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 0',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, background: 'var(--accent)', color: '#fff',
          display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: 26,
        }} title="Daily Ledger">
          <Icon name="ledger" size={22} stroke={2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {items.map(it => {
            const on = active === it.id;
            return (
              <button key={it.id} onClick={() => setActive(it.id)} title={it.label}
                style={{
                  width: 46, height: 46, borderRadius: 12, border: 'none', position: 'relative',
                  background: on ? 'var(--nav-active)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--ink-3)',
                  display: 'grid', placeItems: 'center', transition: 'background .12s, color .12s',
                  boxShadow: on ? 'var(--shadow-xs)' : 'none',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--zebra)'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <Icon name={it.icon} size={22} stroke={on ? 2 : 1.8} />
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <button title="Settings" style={{ width: 46, height: 46, borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
            <Icon name="settings" size={21} />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--sienna)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-sans)' }}>A</div>
        </div>
      </nav>
    );
  }

  /* ===================== Header ===================== */
  function Header({ onAdd, dark, onToggleDark }) {
    return (
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 'var(--gap)', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'nowrap' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 31, letterSpacing: '-.01em', color: 'var(--ink)', whiteSpace: 'nowrap', lineHeight: 1.1, flexShrink: 0 }}>Good evening, Arjun</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontSize: 13, fontWeight: 700 }}>
              <Icon name="flame" size={14} /> 21-day streak
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>Sunday, 14 June 2026 · <span style={{ color: 'var(--ink-3)' }}>12 entries logged today</span></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 40, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', color: 'var(--ink-3)' }}>
            <Icon name="search" size={17} />
            <input placeholder="Search entries" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--ink)', width: 120, fontFamily: 'inherit' }} />
          </div>
          <button onClick={onToggleDark} title="Toggle theme" style={iconBtn}>
            <Icon name={dark ? 'sun' : 'moon'} size={19} />
          </button>
          <button title="Notifications" style={iconBtn}><Icon name="bell" size={19} /></button>
          <button onClick={onAdd} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px',
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)',
            fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-sm)', transition: 'background .12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            <Icon name="plus" size={18} stroke={2.4} /> Add Entry
          </button>
        </div>
      </header>
    );
  }
  const iconBtn = {
    width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'var(--surface)',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', color: 'var(--ink-2)',
  };

  /* ===================== KPI row ===================== */
  function Kpi({ icon, tint, label, value, sub, delta }) {
    return (
      <div style={{ flex: '1 1 0', minWidth: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)', padding: 'var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: tint.soft, color: tint.color, display: 'grid', placeItems: 'center' }}>
            <Icon name={icon} size={20} />
          </span>
          {delta && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700, color: delta.good ? 'var(--good)' : 'var(--bad)' }}>
              <Icon name={delta.dir} size={14} stroke={2.4} />{delta.text}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 3 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)', lineHeight: 1 }}>{value}</span>
          {sub && <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>{sub}</span>}
        </div>
      </div>
    );
  }

  /* ===================== Composer ===================== */
  function Composer({ onAdd, onClose }) {
    const [kind, setKind] = useState('money');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const submit = () => {
      if (!title.trim()) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      onAdd({
        id: 'n' + Date.now(), time: hh, kind, title: title.trim(),
        meta: KIND[kind].label, tag: KIND[kind].label,
        amount: kind === 'money' && amount ? -Math.abs(Number(amount)) : null,
      });
      onClose();
    };
    return (
      <div style={{ padding: 'var(--pad)', borderBottom: '1px solid var(--line)', background: 'var(--zebra)', animation: 'dlslide .2s ease-out' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {Object.keys(KIND).map(k => (
            <button key={k} onClick={() => setKind(k)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 'var(--r-pill)',
              border: '1px solid', fontSize: 13, fontWeight: 600, transition: 'all .12s',
              borderColor: kind === k ? 'transparent' : 'var(--line-2)',
              background: kind === k ? KIND[k].color : 'var(--surface)',
              color: kind === k ? '#fff' : 'var(--ink-2)',
            }}>
              <Icon name={KIND[k].icon} size={15} />{KIND[k].label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="What happened? e.g. Lunch with team"
            style={{ flex: '3 1 220px', height: 42, padding: '0 14px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }} />
          {kind === 'money' && (
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="₹ Amount" inputMode="numeric"
              style={{ flex: '1 1 110px', height: 42, padding: '0 14px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }} />
          )}
          <button onClick={submit} style={{ height: 42, padding: '0 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 600, fontSize: 14 }}>Log it</button>
          <button onClick={onClose} style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', color: 'var(--ink-3)' }}><Icon name="x" size={18} /></button>
        </div>
      </div>
    );
  }

  /* ===================== Ledger ===================== */
  const FILTERS = [{ id: 'all', label: 'All' }, ...Object.keys(KIND).map(k => ({ id: k, label: KIND[k].label }))];

  function Ledger({ entries, composerOpen, onAdd, onCloseComposer }) {
    const [filter, setFilter] = useState('all');
    const shown = filter === 'all' ? entries : entries.filter(e => e.kind === filter);
    const spent = entries.filter(e => e.amount && e.amount < 0).reduce((a, e) => a + e.amount, 0);
    const earned = entries.filter(e => e.amount && e.amount > 0).reduce((a, e) => a + e.amount, 0);
    const net = earned + spent;
    return (
      <section style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px var(--pad)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>Today's Ledger</h2>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{shown.length} entries</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '5px 11px', borderRadius: 'var(--r-pill)', border: '1px solid',
                fontSize: 12.5, fontWeight: 600, transition: 'all .12s',
                borderColor: filter === f.id ? 'transparent' : 'var(--line)',
                background: filter === f.id ? 'var(--ink)' : 'transparent',
                color: filter === f.id ? 'var(--surface)' : 'var(--ink-2)',
              }}>{f.label}</button>
            ))}
          </div>
        </header>

        {composerOpen && <Composer onAdd={onAdd} onClose={onCloseComposer} />}

        <div>
          {shown.map((e, i) => {
            const k = KIND[e.kind];
            return (
              <div key={e.id} className="dl-row" style={{
                display: 'grid', gridTemplateColumns: '52px 38px 1fr auto', alignItems: 'center', gap: 14,
                padding: 'var(--row-pad) var(--pad)', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                transition: 'background .1s',
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{e.time}</span>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: k.soft, color: k.color, display: 'grid', placeItems: 'center' }}>
                  <Icon name={k.icon} size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.meta}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {e.amount != null ? (
                    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: e.amount > 0 ? 'var(--good)' : 'var(--ink)' }}>
                      {e.amount > 0 ? '+₹' + e.amount.toLocaleString('en-IN') : fmtINR(e.amount)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: k.color, background: k.soft, padding: '3px 9px', borderRadius: 'var(--r-pill)' }}>{e.tag}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px var(--pad)', borderTop: '2px solid var(--line)', background: 'var(--subtle)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 22, fontSize: 13 }}>
            <span style={{ color: 'var(--ink-2)' }}>Spent <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{fmtINR(spent)}</strong></span>
            <span style={{ color: 'var(--ink-2)' }}>Earned <strong style={{ color: 'var(--good)', fontWeight: 700 }}>+₹{earned.toLocaleString('en-IN')}</strong></span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: net >= 0 ? 'var(--good)' : 'var(--bad)' }}>
            Net {net >= 0 ? '+₹' + net.toLocaleString('en-IN') : fmtINR(net)}
          </span>
        </footer>
      </section>
    );
  }

  /* ===================== Tweaks ===================== */
  const ACCENTS = {
    Terracotta: { base: '#E35336', deep: '#C8442A', soft: '#FBE3DC' },
    Sienna:     { base: '#A0522D', deep: '#854324', soft: '#F1E2D6' },
    Clay:       { base: '#D98324', deep: '#BC6E18', soft: '#FBEBD3' },
    Olive:      { base: '#6E8B3D', deep: '#5A7330', soft: '#EAF0DC' },
  };
  const DENSITY = { Compact: ['14px', '9px', '12px'], Regular: ['20px', '13px', '18px'], Comfy: ['26px', '17px', '24px'] };
  const CORNERS = { Soft: ['8px', '12px', '16px'], Sharp: ['5px', '7px', '9px'], Round: ['12px', '18px', '24px'] };

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "Terracotta",
    "density": "Regular",
    "corners": "Soft",
    "dark": false,
    "serifHeads": true
  }/*EDITMODE-END*/;

  /* ===================== App ===================== */
  function App() {
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    const [entries, setEntries] = useState(window.SEED_ENTRIES);
    const [habits, setHabits] = useState(window.SEED_HABITS);
    const [mood, setMood] = useState(4);
    const [composerOpen, setComposerOpen] = useState(false);

    // apply tweaks to :root
    useEffect(() => {
      const r = document.documentElement;
      const a = ACCENTS[t.accent] || ACCENTS.Terracotta;
      r.style.setProperty('--accent', a.base);
      r.style.setProperty('--accent-deep', a.deep);
      r.style.setProperty('--accent-soft', a.soft);
      const d = DENSITY[t.density] || DENSITY.Regular;
      r.style.setProperty('--pad', d[0]); r.style.setProperty('--row-pad', d[1]); r.style.setProperty('--gap', d[2]);
      const c = CORNERS[t.corners] || CORNERS.Soft;
      r.style.setProperty('--r-sm', c[0]); r.style.setProperty('--r-md', c[1]); r.style.setProperty('--r-lg', c[2]);
      r.style.setProperty('--font-display', t.serifHeads ? "'Fraunces', Georgia, serif" : "'Inter', sans-serif");
      r.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    }, [t]);

    const toggleHabit = id => setHabits(hs => hs.map(h => h.id === id ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : Math.max(0, h.streak - 1) } : h));
    const addEntry = e => setEntries(es => [e, ...es]);

    const spentToday = entries.filter(e => e.amount && e.amount < 0).reduce((a, e) => a + e.amount, 0);
    const habitsDone = habits.filter(h => h.done).length;
    const curMood = window.MOOD_SCALE.find(m => m.v === mood);

    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas)' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, padding: '28px clamp(20px,3vw,40px) 60px' }}>
          <Header onAdd={() => setComposerOpen(v => !v)} dark={t.dark} onToggleDark={() => setTweak('dark', !t.dark)} />

          <div style={{ display: 'flex', gap: 'var(--gap)', marginBottom: 'var(--gap)', flexWrap: 'wrap' }}>
            <Kpi icon="ledger" tint={{ color: 'var(--accent)', soft: 'var(--accent-soft)' }} label="Entries logged" value={String(entries.length)} sub="today" delta={{ good: true, dir: 'up', text: '+2' }} />
            <Kpi icon="rupee" tint={KIND.money} label="Spent today" value={fmtINR(spentToday).replace('−', '')} delta={{ good: true, dir: 'down', text: '8%' }} />
            <Kpi icon="mind" tint={{ color: curMood.color, soft: 'var(--accent-soft)' }} label="Mood" value={curMood.label} sub={mood + '/5'} delta={{ good: true, dir: 'up', text: '+1' }} />
            <Kpi icon="repeat" tint={KIND.move} label="Habits done" value={habitsDone + '/' + habits.length} sub={Math.round(habitsDone / habits.length * 100) + '%'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(280px,1fr)', gap: 'var(--gap)', alignItems: 'start' }} className="dl-grid">
            <Ledger entries={entries} composerOpen={composerOpen} onAdd={addEntry} onCloseComposer={() => setComposerOpen(false)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
              <HabitsPanel habits={habits} onToggle={toggleHabit} />
              <MoodPanel mood={mood} onPick={setMood} />
              <WeekSpend week={window.SEED_WEEK} />
            </div>
          </div>
        </main>

        <window.TweaksPanel>
          <window.TweakSection label="Theme" />
          <window.TweakColor label="Accent" value={ACCENTS[t.accent].base}
            options={Object.values(ACCENTS).map(a => a.base)}
            onChange={hex => setTweak('accent', Object.keys(ACCENTS).find(k => ACCENTS[k].base === hex))} />
          <window.TweakToggle label="Dark mode" value={t.dark} onChange={v => setTweak('dark', v)} />
          <window.TweakToggle label="Serif headings" value={t.serifHeads} onChange={v => setTweak('serifHeads', v)} />
          <window.TweakSection label="Layout" />
          <window.TweakRadio label="Density" value={t.density} options={Object.keys(DENSITY)} onChange={v => setTweak('density', v)} />
          <window.TweakRadio label="Corners" value={t.corners} options={Object.keys(CORNERS)} onChange={v => setTweak('corners', v)} />
        </window.TweaksPanel>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
