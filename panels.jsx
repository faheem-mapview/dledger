/* Daily Ledger — right-rail widgets: Habits, Mood, Weekly spend */
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  function Card({ title, action, children, pad = true }) {
    return (
      <section style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      }}>
        {title && (
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px var(--pad)', borderBottom: '1px solid var(--line)',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '.01em', color: 'var(--ink)' }}>{title}</h3>
            {action}
          </header>
        )}
        <div style={{ padding: pad ? 'var(--pad)' : 0 }}>{children}</div>
      </section>
    );
  }

  /* ---------------- Habits ---------------- */
  function HabitsPanel({ habits, onToggle }) {
    const done = habits.filter(h => h.done).length;
    const pct = Math.round((done / habits.length) * 100);
    return (
      <Card
        title="Habits"
        action={<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{done}/{habits.length}</span>}
      >
        <div style={{ height: 6, background: 'var(--subtle)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: pct + '%', height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width .35s cubic-bezier(.2,.8,.2,1)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {habits.map(h => (
            <button key={h.id} onClick={() => onToggle(h.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', margin: '0 -8px',
              border: 'none', background: 'transparent', borderRadius: 'var(--r-sm)', textAlign: 'left',
              transition: 'background .12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--zebra)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                border: h.done ? 'none' : '1.8px solid var(--line-2)',
                background: h.done ? 'var(--accent)' : 'transparent',
                color: '#fff', display: 'grid', placeItems: 'center', transition: 'all .15s',
              }}>{h.done && <Icon name="check" size={14} stroke={2.4} />}</span>
              <span style={{
                flex: 1, fontSize: 14, fontWeight: 500,
                color: h.done ? 'var(--ink-3)' : 'var(--ink)',
                textDecoration: h.done ? 'line-through' : 'none',
              }}>{h.name}</span>
              {h.streak > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: 'var(--sandy)' }}>
                  <span style={{ color: 'var(--accent)' }}><Icon name="flame" size={14} fill="var(--accent-soft)" /></span>
                  {h.streak}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  /* ---------------- Mood ---------------- */
  function MoodPanel({ mood, onPick }) {
    const scale = window.MOOD_SCALE;
    const week = window.SEED_MOOD_WEEK;
    const cur = scale.find(s => s.v === mood);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
      <Card title="Mood" action={<span style={{ fontSize: 13, fontWeight: 600, color: cur.color }}>{cur.label}</span>}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 18 }}>
          {scale.map(s => (
            <button key={s.v} onClick={() => onPick(s.v)} title={s.label} style={{
              flex: 1, height: 38, borderRadius: 10, border: '1.5px solid',
              borderColor: mood === s.v ? s.color : 'var(--line)',
              background: mood === s.v ? s.color : 'var(--subtle)',
              display: 'grid', placeItems: 'center', transition: 'all .14s',
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: 99,
                background: mood === s.v ? '#fff' : s.color, opacity: mood === s.v ? 1 : .55,
              }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
          {week.map((v, i) => {
            const c = scale.find(s => s.v === v).color;
            const last = i === week.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%', height: (v / 5) * 40 + 6, borderRadius: 6,
                  background: c, opacity: last ? 1 : .42,
                }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: last ? 'var(--ink)' : 'var(--ink-4)' }}>{days[i]}</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  /* ---------------- Weekly spend ---------------- */
  function WeekSpend({ week }) {
    const max = Math.max(...week.map(w => w.v));
    const total = week.reduce((a, w) => a + w.v, 0);
    const [hover, setHover] = useState(null);
    return (
      <Card
        title="Spending this week"
        action={<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{window.fmtINR(total)}</span>}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 132, paddingTop: 22 }}>
          {week.map((w, i) => (
            <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
              {hover === i && (
                <span style={{
                  position: 'absolute', top: -4, fontSize: 11, fontWeight: 700, color: 'var(--ink)',
                  background: 'var(--surface)', padding: '2px 6px', borderRadius: 6, boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap',
                }}>{window.fmtINR(w.v)}</span>
              )}
              <div style={{
                width: '100%', maxWidth: 26, height: (w.v / max) * 100 + '%', minHeight: 6, borderRadius: 7,
                background: w.today ? 'var(--accent)' : (hover === i ? 'var(--sandy)' : 'var(--line-2)'),
                transition: 'background .14s, height .3s',
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: w.today ? 'var(--accent)' : 'var(--ink-4)' }}>{w.d}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  window.DLCard = Card;
  window.HabitsPanel = HabitsPanel;
  window.MoodPanel = MoodPanel;
  window.WeekSpend = WeekSpend;
})();
