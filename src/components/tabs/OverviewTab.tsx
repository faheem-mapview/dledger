"use client"

import { useState } from "react"
import {
  type FoodItem, type ExerciseItem, type WorkItem, type ScreenItem, type Task, type UserSettings,
  todays, sum, round1, KCAL_PER_KG, saveSettings,
} from "@/lib/firestore"
import { UtensilsCrossed, Dumbbell, Monitor, TrendingUp, CheckSquare } from "lucide-react"

interface Props {
  uid: string; food: FoodItem[]; exercise: ExerciseItem[]; work: WorkItem[]
  screen: ScreenItem[]; tasks: Task[]; settings: UserSettings
  onSettingsChange: (s: UserSettings) => void
}

export function OverviewTab({ uid, food, exercise, work, screen, tasks, settings, onSettingsChange }: Props) {
  const [pWeight, setPWeight] = useState(String(settings.profile.weight ?? ""))
  const [pHeight, setPHeight] = useState(String(settings.profile.height ?? ""))
  const [pAge, setPAge] = useState(String(settings.profile.age ?? ""))
  const [pSex, setPSex] = useState(settings.profile.sex ?? "male")
  const [pActivity, setPActivity] = useState(String(settings.profile.activity ?? "1.375"))
  const [maintVal, setMaintVal] = useState(String(settings.maintenance ?? ""))

  const cIn = sum(todays(food), (x) => x.calories)
  const cOut = sum(todays(exercise), (x) => x.calories)
  const workH = sum(todays(work), (x) => x.hours)
  const screenH = sum(todays(screen), (x) => x.hours)
  const meals = todays(food).length
  const hotel = todays(food).filter((x) => x.source === "hotel").length
  const tasksDone = todays(tasks).filter((x) => x.done).length
  const tasksTotal = todays(tasks).length
  const maint = Number(settings.maintenance) || 0
  const balance = maint ? cIn - (maint + cOut) : null
  const kg = balance !== null ? balance / KCAL_PER_KG : null
  const losing = balance !== null && balance < 0

  function handleCalc() {
    const w = Number(pWeight), h = Number(pHeight), a = Number(pAge), act = Number(pActivity)
    if (!w || !h || !a) return alert("Enter weight, height, and age.")
    const bmr = 10 * w + 6.25 * h - 5 * a + (pSex === "male" ? 5 : -161)
    const m = Math.round(bmr * act)
    const next: UserSettings = { ...settings, maintenance: m, profile: { weight: w, height: h, age: a, sex: pSex, activity: act } }
    setMaintVal(String(m)); onSettingsChange(next); saveSettings(uid, next)
  }

  function handleMaintInput(val: string) {
    setMaintVal(val)
    const next: UserSettings = { ...settings, maintenance: val === "" ? "" : Number(val) }
    onSettingsChange(next); saveSettings(uid, next)
  }

  return (
    <div className="space-y-4">
      {/* Stat cards — 4 columns */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Calories Eaten" value={cIn} sub="kcal today" icon={<UtensilsCrossed className="h-4 w-4" />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Calories Burned" value={cOut} sub="kcal today" icon={<Dumbbell className="h-4 w-4" />} color="text-orange-500" bg="bg-orange-50" />
        <StatCard label="Work Done" value={`${round1(workH)}h`} sub="logged today" icon={<TrendingUp className="h-4 w-4" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Screen Time" value={`${round1(screenH)}h`} sub="logged today" icon={<Monitor className="h-4 w-4" />} color="text-rose-500" bg="bg-rose-50" />
      </div>

      {/* Second row: tasks + meals */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tasks Done" value={`${tasksDone} / ${tasksTotal}`} sub="today" icon={<CheckSquare className="h-4 w-4" />} color="text-primary" bg="bg-primary/10" />
        <StatCard label="Meals Logged" value={meals} sub={`${hotel} eating out`} icon={<UtensilsCrossed className="h-4 w-4" />} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Weight + Calculator */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weight estimate */}
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

          {/* Calorie progress bars */}
          {maint > 0 && (
            <div className="mt-4 space-y-2.5">
              <ProgressBar label="Eaten" value={cIn} max={maint * 1.5} className="bg-emerald-500" />
              <ProgressBar label="Burned" value={cOut} max={maint * 1.5} className="bg-orange-400" />
              <ProgressBar label="Maintenance" value={maint} max={maint * 1.5} className="bg-blue-500" />
            </div>
          )}
        </div>

        {/* Maintenance calculator */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-4">Maintenance Calories</p>
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            {[
              { label: "Weight (kg)", val: pWeight, set: setPWeight, ph: "70" },
              { label: "Height (cm)", val: pHeight, set: setPHeight, ph: "170" },
              { label: "Age", val: pAge, set: setPAge, ph: "30" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
                <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
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
          <div className="flex items-center gap-2">
            <button onClick={handleCalc}
              className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Calculate
            </button>
            <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <span className="text-xs font-semibold text-primary flex-shrink-0">Maint.</span>
              <input type="number" value={maintVal} onChange={(e) => handleMaintInput(e.target.value)} placeholder="—"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-primary outline-none" />
              <span className="text-xs text-primary/70 flex-shrink-0">kcal/day</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Mifflin-St Jeor formula. Keep activity Sedentary if you log workouts separately.</p>
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
      <span className="w-20 text-right text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-xs font-medium text-foreground flex-shrink-0">{value} kcal</span>
    </div>
  )
}
