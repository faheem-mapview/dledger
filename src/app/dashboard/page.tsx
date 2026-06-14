"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "@/lib/auth"
import {
  subscribeTasks, subscribeFood, subscribeExercise, subscribeWork, subscribeScreen, subscribeWeights,
  getSettings, type Task, type FoodItem, type ExerciseItem, type WorkItem, type ScreenItem, type UserSettings, type WeightLog,
} from "@/lib/firestore"
import { OverviewTab } from "@/components/tabs/OverviewTab"
import { TasksTab } from "@/components/tabs/TasksTab"
import { FoodTab } from "@/components/tabs/FoodTab"
import { ExerciseTab } from "@/components/tabs/ExerciseTab"
import { ActivityTab } from "@/components/tabs/ActivityTab"
import { CollectionsTab } from "@/components/tabs/CollectionsTab"
import {
  LayoutDashboard, CheckSquare, UtensilsCrossed, Dumbbell,
  Monitor, BookOpen, LogOut, Settings, CalendarDays, Sun, Moon,
} from "lucide-react"

function DateNav({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const todayStr = new Date().toISOString().slice(0, 10)
  const isToday = date === todayStr
  const label = isToday
    ? "Today"
    : date === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10)
    ? "Yesterday"
    : new Date(date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })

  return (
    <button type="button" onClick={() => inputRef.current?.showPicker()}
      style={{
        display: "flex", alignItems: "center", gap: 6, height: 36,
        padding: "0 12px", borderRadius: 8,
        border: "1px solid #ECE2D2", background: "#fff",
        fontSize: 13, fontWeight: 600, color: "#2A1E16", cursor: "pointer",
        whiteSpace: "nowrap",
      }}>
      <CalendarDays size={14} color="#9D8C78" />
      {label}
      <input ref={inputRef} type="date" value={date} max={todayStr}
        onChange={(e) => { if (e.target.value <= todayStr) onChange(e.target.value) }}
        className="sr-only" />
    </button>
  )
}

const TABS = [
  { id: "overview",    label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks",       label: "Tasks",     icon: CheckSquare },
  { id: "food",        label: "Food",      icon: UtensilsCrossed },
  { id: "exercise",    label: "Exercise",  icon: Dumbbell },
  { id: "activity",    label: "Activity",  icon: Monitor },
  { id: "collections", label: "Log",       icon: BookOpen },
] as const
type TabId = (typeof TABS)[number]["id"]

function greeting(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  return `${g}, ${name.split(" ")[0]}`
}
function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab]         = useState<TabId>("overview")
  const [tasks, setTasks]     = useState<Task[]>([])
  const [food, setFood]       = useState<FoodItem[]>([])
  const [exercise, setEx]     = useState<ExerciseItem[]>([])
  const [work, setWork]       = useState<WorkItem[]>([])
  const [screen, setScreen]   = useState<ScreenItem[]>([])
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [settings, setSettings] = useState<UserSettings>({ maintenance: "", unit: "kg", profile: {} })
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dark, setDark] = useState(false)

  useEffect(() => { document.documentElement.classList.toggle("dark", dark) }, [dark])

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getSettings(user.uid).then(setSettings)
    const unsubs = [
      subscribeTasks(user.uid, setTasks),
      subscribeFood(user.uid, setFood),
      subscribeExercise(user.uid, setEx),
      subscribeWork(user.uid, setWork),
      subscribeScreen(user.uid, setScreen),
      subscribeWeights(user.uid, setWeights),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  if (loading || !user) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#FBF7F0" }}>
        <div style={{ width: 32, height: 32, borderRadius: 99, border: "4px solid #E35336", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const displayName = user.displayName ?? user.email ?? "User"
  const initials = displayName[0].toUpperCase()

  const entryCount = [
    ...food.filter(x => x.date === selectedDate),
    ...exercise.filter(x => x.date === selectedDate),
    ...tasks.filter(x => x.date === selectedDate),
    ...work.filter(x => x.date === selectedDate),
    ...screen.filter(x => x.date === selectedDate),
  ].length

  /* ── shared colors ── */
  const sidebarBg     = "#FFFFFF"
  const sidebarBorder = "1px solid #ECE2D2"
  const activeNavBg   = "#FBE9E1"
  const activeNavClr  = "#E35336"
  const inactiveClr   = "#9D8C78"

  return (
    <>
      {/* ── global layout ── */}
      <style>{`
        body { margin: 0; }
        .dl-sidebar { display: flex; }
        .dl-bottom-nav { display: none; }
        @media (max-width: 767px) {
          .dl-sidebar { display: none !important; }
          .dl-bottom-nav { display: flex !important; }
          .dl-header-greeting { display: none; }
          .dl-main-pad { padding: 16px 16px 80px !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: "#FBF7F0" }}>

        {/* ── Desktop sidebar ── */}
        <nav className="dl-sidebar" style={{
          width: 74, flexShrink: 0,
          background: sidebarBg, borderRight: sidebarBorder,
          flexDirection: "column", alignItems: "center",
          padding: "16px 0", position: "sticky", top: 0, height: "100dvh", zIndex: 30,
        }}>
          {/* Logo */}
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: "#E35336", color: "#fff",
            display: "grid", placeItems: "center",
            boxShadow: "0 1px 3px rgba(80,50,30,.12)", marginBottom: 24,
          }}>
            <LayoutDashboard size={20} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = tab === id
              return (
                <button key={id} onClick={() => setTab(id as TabId)} title={label}
                  style={{
                    width: 46, height: 46, borderRadius: 12, border: "none",
                    background: on ? activeNavBg : "transparent",
                    color: on ? activeNavClr : inactiveClr,
                    display: "grid", placeItems: "center",
                    transition: "background .12s, color .12s", cursor: "pointer",
                    boxShadow: on ? "0 1px 2px rgba(80,50,30,.06)" : "none",
                  }}
                  onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "#FBF6EC" }}
                  onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}>
                  <Icon size={20} strokeWidth={on ? 2.2 : 1.8} />
                </button>
              )
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <button title={dark ? "Light mode" : "Dark mode"} onClick={() => setDark(v => !v)}
              style={{ width: 46, height: 46, borderRadius: 12, border: "none", background: "transparent", color: inactiveClr, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button title="Sign out" onClick={async () => { await signOut(); router.push("/login") }}
              style={{ width: 46, height: 46, borderRadius: 12, border: "none", background: "transparent", color: inactiveClr, display: "grid", placeItems: "center", cursor: "pointer" }}>
              <LogOut size={18} />
            </button>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" style={{ width: 34, height: 34, borderRadius: 99, objectFit: "cover", border: "2px solid #ECE2D2" }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 99, background: "#A0522D", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>
                {initials}
              </div>
            )}
          </div>
        </nav>

        {/* ── Main column ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, padding: "0 20px", height: 60, flexShrink: 0,
            borderBottom: sidebarBorder, background: "#FBF7F0",
          }}>
            {/* Greeting — hidden on mobile via CSS */}
            <div className="dl-header-greeting" style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 600, fontSize: 22, color: "#2A1E16", whiteSpace: "nowrap",
                }}>
                  {greeting(displayName)}
                </span>
                {entryCount > 0 && (
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                    background: "#FBE3DC", color: "#C8442A", whiteSpace: "nowrap",
                  }}>
                    {entryCount} entries
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12.5, color: "#6E5F50", margin: 0 }}>{todayLabel()}</p>
            </div>

            {/* Mobile: show current tab label */}
            <span style={{ fontWeight: 700, fontSize: 16, color: "#2A1E16", display: "none" }} className="dl-mobile-label">
              {TABS.find(t => t.id === tab)?.label}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {tab !== "collections" && (
                <DateNav date={selectedDate} onChange={setSelectedDate} />
              )}
              <button title="Settings"
                style={{ width: 36, height: 36, display: "grid", placeItems: "center", background: "#fff", border: "1px solid #ECE2D2", borderRadius: 8, color: "#6E5F50", cursor: "pointer" }}>
                <Settings size={16} />
              </button>
              {/* Mobile: avatar + sign out */}
              <button title="Sign out" onClick={async () => { await signOut(); router.push("/login") }}
                style={{ width: 36, height: 36, display: "grid", placeItems: "center", background: "transparent", border: "none", color: "#9D8C78", cursor: "pointer" }}
                className="dl-mobile-signout">
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="dl-main-pad" style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,3vw,32px) 60px" }}>
            {tab === "overview"     && <OverviewTab uid={user.uid} food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} date={selectedDate} onSettingsChange={setSettings} />}
            {tab === "tasks"        && <TasksTab uid={user.uid} tasks={tasks} date={selectedDate} />}
            {tab === "food"         && <FoodTab uid={user.uid} food={food} date={selectedDate} />}
            {tab === "exercise"     && <ExerciseTab uid={user.uid} exercise={exercise} date={selectedDate} />}
            {tab === "activity"     && <ActivityTab uid={user.uid} work={work} screen={screen} date={selectedDate} />}
            {tab === "collections"  && <CollectionsTab food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} />}
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="dl-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "#FFFFFF", borderTop: "1px solid #ECE2D2",
        display: "none", /* overridden by media query */
        alignItems: "center", justifyContent: "space-around",
        height: 64, padding: "0 4px",
        boxShadow: "0 -2px 12px rgba(80,50,30,.08)",
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = tab === id
          return (
            <button key={id} onClick={() => setTab(id as TabId)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                flex: 1, height: "100%", border: "none", background: "transparent",
                color: on ? "#E35336" : "#9D8C78", cursor: "pointer",
                fontSize: 10, fontWeight: on ? 700 : 500, fontFamily: "inherit",
                padding: "8px 0",
              }}>
              <Icon size={20} strokeWidth={on ? 2.2 : 1.8} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* show mobile label in header on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .dl-mobile-label { display: block !important; }
          .dl-mobile-signout { display: grid !important; }
        }
        @media (min-width: 768px) {
          .dl-mobile-signout { display: none !important; }
        }
      `}</style>
    </>
  )
}
