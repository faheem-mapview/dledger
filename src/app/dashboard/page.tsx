"use client"

import { useEffect, useState } from "react"
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
  Monitor, BookOpen, LogOut, Bell, Settings, Menu, CalendarDays,
} from "lucide-react"

function DateNav({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const isToday = date === todayStr
  const label = isToday
    ? "Today"
    : date === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10)
    ? "Yesterday"
    : new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })

  return (
    <div className="mb-4 relative">
      <label htmlFor="date-pick" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 hover:bg-accent transition-colors">
        <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{!isToday ? date : ""}</span>
      </label>
      <input type="date" id="date-pick" value={date} max={todayStr}
        onChange={(e) => { if (e.target.value <= todayStr) onChange(e.target.value) }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full" />
    </div>
  )
}

const TABS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "activity", label: "Work & Screen", icon: Monitor },
  { id: "collections", label: "Daily Log", icon: BookOpen },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("overview")
  const [tasks, setTasks] = useState<Task[]>([])
  const [food, setFood] = useState<FoodItem[]>([])
  const [exercise, setExercise] = useState<ExerciseItem[]>([])
  const [work, setWork] = useState<WorkItem[]>([])
  const [screen, setScreen] = useState<ScreenItem[]>([])
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [settings, setSettings] = useState<UserSettings>({ maintenance: "", unit: "kg", profile: {} })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getSettings(user.uid).then(setSettings)
    const unsubs = [
      subscribeTasks(user.uid, setTasks),
      subscribeFood(user.uid, setFood),
      subscribeExercise(user.uid, setExercise),
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

  const currentTab = TABS.find((t) => t.id === tab)!

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200",
        "lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Daily Ledger</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => { setTab(id as TabId); setSidebarOpen(false) }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full flex-shrink-0" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.displayName ?? "User"}</p>
              <p className="truncate text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-background px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-base font-semibold">{currentTab.label}</h1>

          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full ml-1" />
            ) : (
              <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block text-xs text-muted-foreground ml-1 max-w-32 truncate">{user.displayName ?? user.email}</span>
            <button
              onClick={async () => { await signOut(); router.push("/login") }}
              className="ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Date navigator — hidden on Daily Log tab */}
          {tab !== "collections" && (
            <DateNav date={selectedDate} onChange={setSelectedDate} />
          )}
          {tab === "overview" && <OverviewTab uid={user.uid} food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} date={selectedDate} onSettingsChange={setSettings} />}
          {tab === "tasks" && <TasksTab uid={user.uid} tasks={tasks} date={selectedDate} />}
          {tab === "food" && <FoodTab uid={user.uid} food={food} date={selectedDate} />}
          {tab === "exercise" && <ExerciseTab uid={user.uid} exercise={exercise} date={selectedDate} />}
          {tab === "activity" && <ActivityTab uid={user.uid} work={work} screen={screen} date={selectedDate} />}
          {tab === "collections" && <CollectionsTab food={food} exercise={exercise} work={work} screen={screen} tasks={tasks} settings={settings} weights={weights} />}
        </main>
      </div>
    </div>
  )
}
