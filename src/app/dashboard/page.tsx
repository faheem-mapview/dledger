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
import { cn } from "@/lib/utils"
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
    : new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })

  return (
    <button type="button"
      onClick={() => inputRef.current?.showPicker()}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors relative">
      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{label}</span>
      {!isToday && <span className="text-xs text-muted-foreground">{date}</span>}
      <input ref={inputRef} type="date" value={date} max={todayStr}
        onChange={(e) => { if (e.target.value <= todayStr) onChange(e.target.value) }}
        className="sr-only" />
    </button>
  )
}

const TABS = [
  { id: "overview",     label: "Dashboard",    icon: LayoutDashboard },
  { id: "tasks",        label: "Tasks",         icon: CheckSquare },
  { id: "food",         label: "Food",          icon: UtensilsCrossed },
  { id: "exercise",     label: "Exercise",      icon: Dumbbell },
  { id: "activity",     label: "Work & Screen", icon: Monitor },
  { id: "collections",  label: "Daily Log",     icon: BookOpen },
] as const

type TabId = (typeof TABS)[number]["id"]

function greeting(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  return `${g}, ${name.split(" ")[0]}`
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("overview")
  const [tasks, setTasks]     = useState<Task[]>([])
  const [food, setFood]       = useState<FoodItem[]>([])
  const [exercise, setEx]     = useState<ExerciseItem[]>([])
  const [work, setWork]       = useState<WorkItem[]>([])
  const [screen, setScreen]   = useState<ScreenItem[]>([])
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [settings, setSettings] = useState<UserSettings>({ maintenance: "", unit: "kg", profile: {} })
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const entryCountToday = [
    ...food.filter(x => x.date === selectedDate),
    ...exercise.filter(x => x.date === selectedDate),
    ...tasks.filter(x => x.date === selectedDate),
    ...work.filter(x => x.date === selectedDate),
    ...screen.filter(x => x.date === selectedDate),
  ].length

  const displayName = user.displayName ?? user.email ?? "User"
  const initials = displayName[0].toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Icon Sidebar ── */}
      <nav style={{
        width: 74, flexShrink: 0,
        background: "var(--color-card, #fff)",
        borderRight: "1px solid var(--color-border, #ECE2D2)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "16px 0", position: "sticky", top: 0, height: "100vh", zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: "#E35336", color: "#fff",
          display: "grid", placeItems: "center",
          boxShadow: "0 1px 3px rgba(80,50,30,.12)",
          marginBottom: 24,
        }} title="Daily Ledger">
          <LayoutDashboard size={20} />
        </div>

        {/* Nav icons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = tab === id
            return (
              <button key={id} onClick={() => setTab(id as TabId)} title={label}
                style={{
                  width: 46, height: 46, borderRadius: 12, border: "none",
                  background: on ? "#FBE9E1" : "transparent",
                  color: on ? "#E35336" : "#9D8C78",
                  display: "grid", placeItems: "center",
                  transition: "background .12s, color .12s",
                  cursor: "pointer",
                  boxShadow: on ? "0 1px 2px rgba(80,50,30,.06)" : "none",
                }}
                onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "#FBF6EC" }}
                onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}>
                <Icon size={20} strokeWidth={on ? 2.2 : 1.8} />
              </button>
            )
          })}
        </div>

        {/* Bottom: dark mode + user avatar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <button title={dark ? "Light mode" : "Dark mode"}
            onClick={() => setDark(v => !v)}
            style={{ width: 46, height: 46, borderRadius: 12, border: "none", background: "transparent", color: "#9D8C78", display: "grid", placeItems: "center", cursor: "pointer" }}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button title="Sign out"
            onClick={async () => { await signOut(); router.push("/login") }}
            style={{ width: 46, height: 46, borderRadius: 12, border: "none", background: "transparent", color: "#9D8C78", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <LogOut size={18} />
          </button>
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: 99, objectFit: "cover", border: "2px solid #ECE2D2" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 99, background: "#A0522D", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>
              {initials}
            </div>
          )}
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 16, padding: "22px 28px 18px",
          borderBottom: "1px solid var(--color-border, #ECE2D2)",
          background: "var(--color-background, #FBF7F0)",
          flexWrap: "wrap",
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
              <h1 style={{
                margin: 0, fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600, fontSize: 28, letterSpacing: "-.01em",
                color: "var(--color-foreground, #2A1E16)", whiteSpace: "nowrap", lineHeight: 1.15,
              }}>
                {greeting(displayName)}
              </h1>
              {entryCountToday > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: "#FBE3DC", color: "#C8442A",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {entryCountToday} entries today
                </span>
              )}
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#6E5F50" }}>
              {todayLabel()}
              {selectedDate !== new Date().toISOString().slice(0, 10) && (
                <span style={{ color: "#9D8C78", marginLeft: 6 }}>
                  · Viewing {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {tab !== "collections" && (
              <DateNav date={selectedDate} onChange={setSelectedDate} />
            )}
            <button title="Settings" style={{
              width: 38, height: 38, display: "grid", placeItems: "center",
              background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #ECE2D2)",
              borderRadius: 8, color: "#6E5F50", cursor: "pointer",
            }}>
              <Settings size={17} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: "24px clamp(16px,3vw,32px) 60px" }}>
          {tab === "overview"     && <OverviewTab uid={user.uid} food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} date={selectedDate} onSettingsChange={setSettings} />}
          {tab === "tasks"        && <TasksTab uid={user.uid} tasks={tasks} date={selectedDate} />}
          {tab === "food"         && <FoodTab uid={user.uid} food={food} date={selectedDate} />}
          {tab === "exercise"     && <ExerciseTab uid={user.uid} exercise={exercise} date={selectedDate} />}
          {tab === "activity"     && <ActivityTab uid={user.uid} work={work} screen={screen} date={selectedDate} />}
          {tab === "collections"  && <CollectionsTab food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} />}
        </main>
      </div>
    </div>
  )
}
