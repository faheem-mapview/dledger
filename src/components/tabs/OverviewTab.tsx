"use client"

import { useState, useEffect, useRef } from "react"
import {
  type FoodItem, type ExerciseItem, type WorkItem, type ScreenItem, type Task,
  type UserSettings, type WeightLog,
  sum, round1, KCAL_PER_KG, saveSettings, logWeight, deleteWeightLog, today,
} from "@/lib/firestore"
import { UtensilsCrossed, Dumbbell, Monitor, TrendingUp, CheckSquare, Weight, ChevronDown, ChevronUp } from "lucide-react"

interface Props {
  uid: string; food: FoodItem[]; exercise: ExerciseItem[]; work: WorkItem[]
  screen: ScreenItem[]; tasks: Task[]; settings: UserSettings; weights: WeightLog[]
  date: string
  onSettingsChange: (s: UserSettings) => void
}

export function OverviewTab({ uid, food, exercise, work, screen, tasks, settings, weights, date, onSettingsChange }: Props) {
  const [pWeight, setPWeight] = useState("")
  const [pHeight, setPHeight] = useState("")
  const [pDob, setPDob] = useState("")
  const [pSex, setPSex] = useState("male")
  const [pActivity, setPActivity] = useState("1.375")
  const [maintVal, setMaintVal] = useState("")
  const [weightInput, setWeightInput] = useState("")
  const [showCalc, setShowCalc] = useState(false)
  const synced = useRef(false)

  // Sync form state once when real settings arrive from Firestore
  useEffect(() => {
    if (synced.current) return
    if (settings.maintenance !== "" || settings.profile.weight || settings.profile.height) {
      synced.current = true
      setPWeight(String(settings.profile.weight ?? ""))
      setPHeight(String(settings.profile.height ?? ""))
      setPDob(settings.profile.dob ?? "")
      setPSex(settings.profile.sex ?? "male")
      setPActivity(String(settings.profile.activity ?? "1.375"))
      setMaintVal(String(settings.maintenance ?? ""))
    }
  }, [settings])

  const fd = (arr: { date: string }[]) => arr.filter((x) => x.date === date)
  const cIn = sum(fd(food) as FoodItem[], (x) => x.calories)
  const cOut = sum(fd(exercise) as ExerciseItem[], (x) => x.calories)
  const workH = sum(fd(work) as WorkItem[], (x) => x.hours)
  const screenH = sum(fd(screen) as ScreenItem[], (x) => x.hours)
  const meals = fd(food).length
  const hotel = (fd(food) as FoodItem[]).filter((x) => x.source === "hotel").length
  const tasksDone = (fd(tasks) as Task[]).filter((x) => x.done).length
  const tasksTotal = fd(tasks).length
  const maint = Number(settings.maintenance) || 0
  const balance = maint ? cIn - (maint + cOut) : null
  const kg = balance !== null ? balance / KCAL_PER_KG : null
  const losing = balance !== null && balance < 0

  const todayWeight = weights.find((w) => w.date === date)

  function ageFromDob(dob: string) {
    if (!dob) return 0
    const today = new Date()
    const b = new Date(dob)
    let age = today.getFullYear() - b.getFullYear()
    if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--
    return age
  }

  function handleCalc() {
    const w = Number(pWeight), h = Number(pHeight), act = Number(pActivity), a = ageFromDob(pDob)
    if (!w || !h || !pDob) return alert("Enter weight, height, and date of birth.")
    const bmr = 10 * w + 6.25 * h - 5 * a + (pSex === "male" ? 5 : -161)
    const m = Math.round(bmr * act)
    const next: UserSettings = { ...settings, maintenance: m, profile: { weight: w, height: h, dob: pDob, sex: pSex, activity: act } }
    setMaintVal(String(m)); onSettingsChange(next); saveSettings(uid, next)
  }

  function handleMaintInput(val: string) {
    setMaintVal(val)
    const next: UserSettings = { ...settings, maintenance: val === "" ? "" : Number(val) }
    onSettingsChange(next); saveSettings(uid, next)
  }

  async function handleLogWeight() {
    const val = Number(weightInput)
    if (!val || val < 20 || val > 300) return
    await logWeight(uid, val, date)
    setWeightInput("")
    // Auto-recalculate maintenance if profile is complete
    const { height, dob, sex, activity } = settings.profile
    const age = dob ? ageFromDob(dob) : 0
    if (height && age && sex && activity) {
      const bmr = 10 * val + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)
      const m = Math.round(bmr * activity)
      const next: UserSettings = { ...settings, maintenance: m, profile: { ...settings.profile, weight: val, dob } }
      setPWeight(String(val))
      setMaintVal(String(m))
      onSettingsChange(next)
      saveSettings(uid, next)
    }
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Calories Eaten" value={cIn} sub="kcal today" icon={<UtensilsCrossed className="h-4 w-4" />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Calories Burned" value={cOut} sub="kcal today" icon={<Dumbbell className="h-4 w-4" />} color="text-orange-500" bg="bg-orange-50" />
        <StatCard label="Work Done" value={`${round1(workH)}h`} sub="logged today" icon={<TrendingUp className="h-4 w-4" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Screen Time" value={`${round1(screenH)}h`} sub="logged today" icon={<Monitor className="h-4 w-4" />} color="text-rose-500" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tasks Done" value={`${tasksDone} / ${tasksTotal}`} sub="today" icon={<CheckSquare className="h-4 w-4" />} color="text-primary" bg="bg-primary/10" />
        <StatCard label="Meals Logged" value={meals} sub={`${hotel} eating out`} icon={<UtensilsCrossed className="h-4 w-4" />} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Weight + Calculator */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weight estimate + log */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Today&apos;s Weight Estimate</p>
            {kg !== null && (cIn > 0 || cOut > 0) && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${losing ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"}`}>
                {losing ? "Deficit" : "Surplus"}
              </span>
            )}
          </div>
          {kg !== null && (cIn > 0 || cOut > 0) ? (
            <>
              <p className={`text-4xl font-bold mb-2 ${losing ? "text-emerald-600" : "text-orange-500"}`}>
                {losing ? "−" : "+"}{Math.abs(round1(kg * 100) / 100).toFixed(2)} <span className="text-lg font-medium text-muted-foreground">kg</span>
              </p>
              <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                {cIn} eaten − ({maint} maint + {cOut} burned) = <strong className="text-foreground">{balance! > 0 ? "+" : ""}{balance} kcal</strong>
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-border mb-2">—</p>
              <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                {!maint ? "Set maintenance calories →" : "Add food and exercise to see an estimate."}
              </p>
            </>
          )}

          {maint > 0 && (
            <div className="mt-4 space-y-2.5">
              <ProgressBar label="Eaten" value={cIn} max={maint * 1.5} className="bg-emerald-500" />
              <ProgressBar label="Burned" value={cOut} max={maint * 1.5} className="bg-orange-400" />
              <ProgressBar label="Maint." value={maint} max={maint * 1.5} className="bg-blue-500" />
            </div>
          )}

          {/* Log actual weight */}
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Weight className="h-3.5 w-3.5" /> Log Actual Weight
            </p>
            {todayWeight ? (
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <span className="text-sm font-bold">{todayWeight.kg} kg <span className="text-xs font-normal text-muted-foreground">logged today</span></span>
                <button onClick={() => deleteWeightLog(uid, date)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
                  placeholder="e.g. 72.5" min="20" max="300" step="0.1"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={handleLogWeight}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Save kg
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance calculator */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <button onClick={() => setShowCalc((v) => !v)}
            className="flex w-full items-center justify-between">
            <p className="text-sm font-semibold">Maintenance Calories</p>
            <div className="flex items-center gap-2">
              {maint > 0 && !showCalc && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{maint} kcal/day</span>
              )}
              {showCalc ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {!maint && !showCalc && (
            <p className="mt-2 text-xs text-muted-foreground">Not set — tap to configure once.</p>
          )}

          {showCalc && (
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-2.5 mb-2.5 sm:grid-cols-2">
                {[
                  { label: "Weight (kg)", val: pWeight, set: setPWeight, ph: "70", type: "number" },
                  { label: "Height (cm)", val: pHeight, set: setPHeight, ph: "170", type: "number" },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label}>
                    <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
                    <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Date of Birth {pDob && <span className="text-primary font-semibold">· Age {ageFromDob(pDob)}</span>}
                  </label>
                  <input type="date" value={pDob} onChange={(e) => setPDob(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Sex</label>
                  <select value={pSex} onChange={(e) => setPSex(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs text-muted-foreground">Activity level</label>
                <select value={pActivity} onChange={(e) => setPActivity(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Light activity</option>
                  <option value="1.55">Moderate activity</option>
                  <option value="1.725">Very active</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button onClick={() => { handleCalc(); setShowCalc(false) }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Calculate &amp; Save
                </button>
                <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                  <span className="text-xs font-semibold text-primary flex-shrink-0">Maint.</span>
                  <input type="number" value={maintVal} onChange={(e) => handleMaintInput(e.target.value)} placeholder="—"
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-primary outline-none" />
                  <span className="text-xs text-primary/70 flex-shrink-0">kcal/day</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Mifflin-St Jeor formula. Height stays constant — only weight updates automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Overall Analytics ── */}
      <AnalyticsSection food={food} weights={weights} />
    </div>
  )
}

function AnalyticsSection({ food, weights }: { food: FoodItem[]; weights: WeightLog[] }) {
  const sortedW = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const firstKg = sortedW[0]?.kg
  const lastKg = sortedW[sortedW.length - 1]?.kg
  const weightChange = firstKg !== undefined && lastKg !== undefined && sortedW.length >= 2
    ? round1(lastKg - firstKg) : null
  const losing = weightChange !== null && weightChange < 0

  const foodDates = [...new Set(food.map((x) => x.date))]
  const avgCal = foodDates.length
    ? Math.round(food.reduce((a, x) => a + (x.calories || 0), 0) / foodDates.length) : null

  const eatingOut = food.filter((x) => x.source === "hotel")
  const lastEODate = eatingOut.length
    ? [...eatingOut].sort((a, b) => b.date.localeCompare(a.date))[0].date : null
  const lastEOLabel = lastEODate
    ? new Date(lastEODate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null

  if (!sortedW.length && !avgCal) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
      <p className="text-sm font-semibold">Overall Progress</p>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {weightChange !== null && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Weight change</p>
            <p className={`text-xl font-bold ${losing ? "text-emerald-600" : "text-orange-500"}`}>
              {losing ? "" : "+"}{weightChange} <span className="text-sm font-medium">kg</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {round1(firstKg!)} → {round1(lastKg!)} kg
            </p>
          </div>
        )}
        {avgCal !== null && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Avg calories/day</p>
            <p className="text-xl font-bold text-emerald-600">{avgCal} <span className="text-sm font-medium">kcal</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">over {foodDates.length} days</p>
          </div>
        )}
        {eatingOut.length > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Eating out</p>
            <p className="text-xl font-bold text-orange-500">{eatingOut.length} <span className="text-sm font-medium">times</span></p>
            {lastEOLabel && <p className="text-[11px] text-muted-foreground mt-0.5">last {lastEOLabel}</p>}
          </div>
        )}
      </div>

      {/* Weight graph */}
      {sortedW.length >= 2 && <WeightGraph weights={sortedW} />}
    </div>
  )
}

function WeightGraph({ weights }: { weights: WeightLog[] }) {
  const W = 300, H = 80, PAD = 8
  const kgs = weights.map((w) => w.kg)
  const minKg = Math.min(...kgs)
  const maxKg = Math.max(...kgs)
  const range = maxKg - minKg || 1

  const pts = weights.map((w, i) => {
    const x = PAD + (i / (weights.length - 1)) * (W - PAD * 2)
    const y = PAD + (1 - (w.kg - minKg) / range) * (H - PAD * 2)
    return { x, y, kg: w.kg, date: w.date }
  })

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const area = `${path} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`

  const firstDate = new Date(weights[0].date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
  const lastDate = new Date(weights[weights.length - 1].date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })

  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-2">Weight log ({weights.length} entries)</p>
      <div className="w-full overflow-hidden rounded-lg bg-muted p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.546 0.245 262.881)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="oklch(0.546 0.245 262.881)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#wg)" />
          <path d={path} fill="none" stroke="oklch(0.546 0.245 262.881)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="oklch(0.546 0.245 262.881)" />
          ))}
        </svg>
        <div className="flex justify-between mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">{firstDate} · {weights[0].kg}kg</span>
          <span className="text-[10px] text-muted-foreground">{lastDate} · {weights[weights.length - 1].kg}kg</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color, bg }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${color}`}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function ProgressBar({ label, value, max, className }: { label: string; value: number; max: number; className: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-right text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-xs font-medium text-foreground flex-shrink-0 text-right">{value}</span>
    </div>
  )
}
