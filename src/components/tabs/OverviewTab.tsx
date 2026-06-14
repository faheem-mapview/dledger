"use client"

import { useState, useEffect, useRef } from "react"
import {
  type FoodItem, type ExerciseItem, type WorkItem, type ScreenItem, type Task,
  type UserSettings, type WeightLog,
  sum, round1, KCAL_PER_KG, saveSettings, logWeight, deleteWeightLog,
} from "@/lib/firestore"
import { UtensilsCrossed, Dumbbell, Monitor, TrendingUp, CheckSquare, Weight, ChevronDown, ChevronUp } from "lucide-react"

interface Props {
  uid: string; food: FoodItem[]; exercise: ExerciseItem[]; work: WorkItem[]
  screen: ScreenItem[]; tasks: Task[]; settings: UserSettings; weights: WeightLog[]
  date: string
  onSettingsChange: (s: UserSettings) => void
}

/* ── Palette tints matching reference ── */
const T = {
  terracotta: { color: "#E35336", soft: "#FBE3DC" },
  olive:      { color: "#6E8B3D", soft: "#EAF0DC" },
  blue:       { color: "#4A7FA5", soft: "#DFF0FB" },
  amber:      { color: "#D98324", soft: "#FBEBD3" },
  rose:       { color: "#C0402B", soft: "#F7E0D9" },
  ink:        { color: "#6E5F50", soft: "#F6EFE3" },
}

function Kpi({ icon, tint, label, value, sub, delta }: {
  icon: React.ReactNode; tint: { color: string; soft: string }
  label: string; value: string | number; sub?: string
  delta?: { good: boolean; text: string }
}) {
  return (
    <div style={{
      flex: "1 1 0", minWidth: 0,
      background: "#fff",
      border: "1px solid #ECE2D2",
      borderRadius: 14, padding: 20,
      boxShadow: "0 1px 3px rgba(80,50,30,.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{
          width: 38, height: 38, borderRadius: 10,
          background: tint.soft, color: tint.color,
          display: "grid", placeItems: "center",
        }}>
          {icon}
        </span>
        {delta && (
          <span style={{
            fontSize: 11.5, fontWeight: 700,
            color: delta.good ? "#6E8B3D" : "#C0402B",
            background: delta.good ? "#EAF0DC" : "#F7E0D9",
            padding: "3px 8px", borderRadius: 999,
          }}>
            {delta.text}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: "#6E5F50", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: "#2A1E16", lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: 12.5, color: "#9D8C78", fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  )
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 48, textAlign: "right", fontSize: 12, color: "#9D8C78", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#F6EFE3", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: color, transition: "width .4s ease" }} />
      </div>
      <span style={{ width: 52, fontSize: 12, fontWeight: 600, color: "#2A1E16", flexShrink: 0, textAlign: "right" }}>{value}</span>
    </div>
  )
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
  const cIn    = sum(fd(food) as FoodItem[], (x) => x.calories)
  const cOut   = sum(fd(exercise) as ExerciseItem[], (x) => x.calories)
  const workH  = sum(fd(work) as WorkItem[], (x) => x.hours)
  const screenH = sum(fd(screen) as ScreenItem[], (x) => x.hours)
  const meals  = fd(food).length
  const hotel  = (fd(food) as FoodItem[]).filter((x) => x.source === "hotel").length
  const tasksDone  = (fd(tasks) as Task[]).filter((x) => x.done).length
  const tasksTotal = fd(tasks).length
  const maint  = Number(settings.maintenance) || 0
  const balance = maint ? cIn - (maint + cOut) : null
  const kg = balance !== null ? balance / KCAL_PER_KG : null
  const losing = balance !== null && balance < 0

  const todayWeight = weights.find((w) => w.date === date)

  function ageFromDob(dob: string) {
    if (!dob) return 0
    const now = new Date()
    const b = new Date(dob)
    let age = now.getFullYear() - b.getFullYear()
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--
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
    const { height, dob, sex, activity } = settings.profile
    const age = dob ? ageFromDob(dob) : 0
    if (height && age && sex && activity) {
      const bmr = 10 * val + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)
      const m = Math.round(bmr * activity)
      const next: UserSettings = { ...settings, maintenance: m, profile: { ...settings.profile, weight: val, dob } }
      setPWeight(String(val)); setMaintVal(String(m))
      onSettingsChange(next); saveSettings(uid, next)
    }
  }

  /* Auto-save when activity level changes (if profile already filled) */
  function handleActivityChange(val: string) {
    setPActivity(val)
    const w = Number(pWeight), h = Number(pHeight), a = ageFromDob(pDob)
    if (w && h && pDob) {
      const act = Number(val)
      const bmr = 10 * w + 6.25 * h - 5 * a + (pSex === "male" ? 5 : -161)
      const m = Math.round(bmr * act)
      const next: UserSettings = { ...settings, maintenance: m, profile: { ...settings.profile, activity: act } }
      setMaintVal(String(m)); onSettingsChange(next); saveSettings(uid, next)
    } else {
      const next: UserSettings = { ...settings, profile: { ...settings.profile, activity: Number(val) } }
      onSettingsChange(next); saveSettings(uid, next)
    }
  }

  /* ── card style ── */
  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #ECE2D2", borderRadius: 14,
    padding: "20px", boxShadow: "0 1px 3px rgba(80,50,30,.07)",
  }
  const label: React.CSSProperties = { fontSize: 12.5, color: "#6E5F50", fontWeight: 500, marginBottom: 4 }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Overall Analytics ── */}
      <AnalyticsSection food={food} weights={weights} />

      {/* ── KPI grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
        <Kpi icon={<UtensilsCrossed size={19} />} tint={T.terracotta} label="Calories Eaten"  value={cIn}                  sub="kcal"
          delta={maint ? { good: cIn <= maint, text: cIn <= maint ? "On track" : "Over" } : undefined} />
        <Kpi icon={<Dumbbell size={19} />}        tint={T.olive}      label="Calories Burned" value={cOut}                 sub="kcal" />
        <Kpi icon={<TrendingUp size={19} />}      tint={T.blue}       label="Work Hours"       value={round1(workH) + "h"} sub="today" />
        <Kpi icon={<Monitor size={19} />}         tint={T.rose}       label="Screen Time"      value={round1(screenH) + "h"} sub="today" />
        <Kpi icon={<CheckSquare size={19} />}     tint={T.amber}      label="Tasks Done"   value={`${tasksDone} / ${tasksTotal}`} sub="today" />
        <Kpi icon={<UtensilsCrossed size={19} />} tint={T.ink}        label="Meals Logged" value={meals} sub={hotel > 0 ? `${hotel} eating out` : "logged"} />
      </div>

      {/* ── Weight + Calculator ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

        {/* Weight estimate */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={{ ...label, marginBottom: 0, fontSize: 14, fontWeight: 600, color: "#2A1E16" }}>Weight Estimate</p>
            {kg !== null && (cIn > 0 || cOut > 0) && (
              <span style={{
                fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                background: losing ? "#EAF0DC" : "#FBEBD3",
                color: losing ? "#6E8B3D" : "#D98324",
              }}>
                {losing ? "Deficit" : "Surplus"}
              </span>
            )}
          </div>

          {kg !== null && (cIn > 0 || cOut > 0) ? (
            <>
              <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.02em", color: losing ? "#6E8B3D" : "#D98324", lineHeight: 1, marginBottom: 8 }}>
                {losing ? "−" : "+"}{Math.abs(round1(kg * 100) / 100).toFixed(2)}
                <span style={{ fontSize: 16, fontWeight: 500, color: "#9D8C78", marginLeft: 4 }}>kg</span>
              </p>
              <p style={{ fontSize: 12, color: "#9D8C78", background: "#F6EFE3", borderRadius: 8, padding: "8px 12px" }}>
                {cIn} eaten − ({maint} maint + {cOut} burned) = <strong style={{ color: "#2A1E16" }}>{balance! > 0 ? "+" : ""}{balance} kcal</strong>
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 36, fontWeight: 700, color: "#DECFB8", lineHeight: 1, marginBottom: 8 }}>—</p>
              <p style={{ fontSize: 12, color: "#9D8C78", background: "#F6EFE3", borderRadius: 8, padding: "8px 12px" }}>
                {!maint ? "Set maintenance calories →" : "Add food and exercise to see an estimate."}
              </p>
            </>
          )}

          {maint > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <ProgressBar label="Eaten"  value={cIn}  max={maint * 1.5} color="#E35336" />
              <ProgressBar label="Burned" value={cOut} max={maint * 1.5} color="#6E8B3D" />
              <ProgressBar label="Maint." value={maint} max={maint * 1.5} color="#4A7FA5" />
            </div>
          )}

          {/* Log weight */}
          <div style={{ marginTop: 18, borderTop: "1px solid #ECE2D2", paddingTop: 16 }}>
            <p style={{ ...label, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Weight size={14} /> Log Actual Weight
            </p>
            {todayWeight ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6EFE3", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2A1E16" }}>
                  {todayWeight.kg} kg <span style={{ fontSize: 12, fontWeight: 400, color: "#9D8C78" }}>logged</span>
                </span>
                <button onClick={() => deleteWeightLog(uid, date)}
                  style={{ fontSize: 12, color: "#9D8C78", background: "none", border: "none", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
                  placeholder="e.g. 72.5" min="20" max="300" step="0.1"
                  style={{ flex: 1, height: 40, padding: "0 12px", border: "1px solid #DECFB8", borderRadius: 8, fontSize: 14, background: "#FBF7F0", color: "#2A1E16", outline: "none", fontFamily: "inherit" }} />
                <button onClick={handleLogWeight}
                  style={{ height: 40, padding: "0 16px", background: "#E35336", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance calculator */}
        <div style={card}>
          <button onClick={() => setShowCalc((v) => !v)}
            style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#2A1E16", margin: 0 }}>Maintenance Calories</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {maint > 0 && !showCalc && (
                <span style={{ fontSize: 12, fontWeight: 700, background: "#FBE3DC", color: "#E35336", padding: "3px 10px", borderRadius: 999 }}>
                  {maint} kcal/day
                </span>
              )}
              {showCalc ? <ChevronUp size={16} color="#9D8C78" /> : <ChevronDown size={16} color="#9D8C78" />}
            </div>
          </button>

          {!maint && !showCalc && (
            <p style={{ marginTop: 8, fontSize: 12.5, color: "#9D8C78" }}>Not set — tap to configure once.</p>
          )}

          {showCalc && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[
                  { label: "Weight (kg)", val: pWeight, set: setPWeight, ph: "70", type: "number" },
                  { label: "Height (cm)", val: pHeight, set: setPHeight, ph: "170", type: "number" },
                ].map(({ label: lbl, val, set, ph, type }) => (
                  <div key={lbl}>
                    <label style={{ ...label, display: "block", marginBottom: 6 }}>{lbl}</label>
                    <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                      style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid #DECFB8", borderRadius: 8, fontSize: 13.5, background: "#FBF7F0", color: "#2A1E16", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ ...label, display: "block", marginBottom: 6 }}>
                    Date of Birth {pDob && <span style={{ color: "#E35336", fontWeight: 700 }}>· Age {ageFromDob(pDob)}</span>}
                  </label>
                  <input type="date" value={pDob} onChange={(e) => setPDob(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid #DECFB8", borderRadius: 8, fontSize: 13.5, background: "#FBF7F0", color: "#2A1E16", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ ...label, display: "block", marginBottom: 6 }}>Sex</label>
                  <select value={pSex} onChange={(e) => setPSex(e.target.value)}
                    style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid #DECFB8", borderRadius: 8, fontSize: 13.5, background: "#FBF7F0", color: "#2A1E16", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...label, display: "block", marginBottom: 6 }}>Activity level</label>
                <select value={pActivity} onChange={(e) => handleActivityChange(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid #DECFB8", borderRadius: 8, fontSize: 13.5, background: "#FBF7F0", color: "#2A1E16", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}>
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Light activity</option>
                  <option value="1.55">Moderate activity</option>
                  <option value="1.725">Very active</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => { handleCalc(); setShowCalc(false) }}
                  style={{ height: 38, padding: "0 16px", background: "#E35336", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                  Calculate &amp; Save
                </button>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, borderRadius: 8, border: "1px solid #FBE3DC", background: "#FBF4F2", padding: "0 12px", height: 38, minWidth: 120 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#E35336", flexShrink: 0 }}>Maint.</span>
                  <input type="number" value={maintVal} onChange={(e) => handleMaintInput(e.target.value)} placeholder="—"
                    style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", fontSize: 14, fontWeight: 700, color: "#E35336", outline: "none", fontFamily: "inherit" }} />
                  <span style={{ fontSize: 11, color: "#E35336", opacity: 0.7, flexShrink: 0 }}>kcal/day</span>
                </div>
              </div>
              <p style={{ marginTop: 10, fontSize: 11.5, color: "#9D8C78" }}>Mifflin-St Jeor · height stays constant, only weight updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalyticsSection({ food, weights }: { food: FoodItem[]; weights: WeightLog[] }) {
  const sortedW = [...weights].sort((a, b) => a.date.localeCompare(b.date))
  const firstKg = sortedW[0]?.kg
  const lastKg  = sortedW[sortedW.length - 1]?.kg
  const weightChange = firstKg !== undefined && lastKg !== undefined && sortedW.length >= 2
    ? round1(lastKg - firstKg) : null
  const losing = weightChange !== null && weightChange < 0

  const foodDates = [...new Set(food.map((x) => x.date))]
  const avgCal = foodDates.length
    ? Math.round(food.reduce((a, x) => a + (x.calories || 0), 0) / foodDates.length) : null

  const eatingOut  = food.filter((x) => x.source === "hotel")
  const lastEODate = eatingOut.length
    ? [...eatingOut].sort((a, b) => b.date.localeCompare(a.date))[0].date : null
  const lastEOLabel = lastEODate
    ? new Date(lastEODate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null

  if (!sortedW.length && !avgCal) return null

  const statBox: React.CSSProperties = {
    background: "#F6EFE3", borderRadius: 10, padding: "14px 16px", flex: "1 1 0", minWidth: 0,
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ECE2D2", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(80,50,30,.07)" }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 17, color: "#2A1E16", margin: "0 0 16px" }}>
        Overall Progress
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: sortedW.length >= 2 ? 16 : 0 }}>
        {weightChange !== null && (
          <div style={statBox}>
            <p style={{ fontSize: 11.5, color: "#9D8C78", marginBottom: 6 }}>Weight change</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: losing ? "#6E8B3D" : "#D98324", margin: "0 0 3px", lineHeight: 1 }}>
              {losing ? "" : "+"}{weightChange} <span style={{ fontSize: 13, fontWeight: 500 }}>kg</span>
            </p>
            <p style={{ fontSize: 11, color: "#9D8C78" }}>{round1(firstKg!)} → {round1(lastKg!)} kg</p>
          </div>
        )}
        {avgCal !== null && (
          <div style={statBox}>
            <p style={{ fontSize: 11.5, color: "#9D8C78", marginBottom: 6 }}>Avg calories/day</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#E35336", margin: "0 0 3px", lineHeight: 1 }}>
              {avgCal} <span style={{ fontSize: 13, fontWeight: 500 }}>kcal</span>
            </p>
            <p style={{ fontSize: 11, color: "#9D8C78" }}>over {foodDates.length} days</p>
          </div>
        )}
        {eatingOut.length > 0 && (
          <div style={statBox}>
            <p style={{ fontSize: 11.5, color: "#9D8C78", marginBottom: 6 }}>Eating out</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#D98324", margin: "0 0 3px", lineHeight: 1 }}>
              {eatingOut.length} <span style={{ fontSize: 13, fontWeight: 500 }}>times</span>
            </p>
            {lastEOLabel && <p style={{ fontSize: 11, color: "#9D8C78" }}>last {lastEOLabel}</p>}
          </div>
        )}
      </div>

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
  const lastDate  = new Date(weights[weights.length - 1].date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })

  return (
    <div>
      <p style={{ fontSize: 11.5, color: "#9D8C78", marginBottom: 8 }}>Weight log ({weights.length} entries)</p>
      <div style={{ background: "#F6EFE3", borderRadius: 10, padding: 8, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80, display: "block" }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E35336" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E35336" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#wg)" />
          <path d={path} fill="none" stroke="#E35336" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#E35336" />)}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 4px" }}>
          <span style={{ fontSize: 10.5, color: "#9D8C78" }}>{firstDate} · {weights[0].kg}kg</span>
          <span style={{ fontSize: 10.5, color: "#9D8C78" }}>{lastDate} · {weights[weights.length - 1].kg}kg</span>
        </div>
      </div>
    </div>
  )
}
