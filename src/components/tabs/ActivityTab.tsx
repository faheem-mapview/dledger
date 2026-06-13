"use client"

import { useState } from "react"
import { addWork, deleteWork, addScreen, deleteScreen, type WorkItem, type ScreenItem, today, todays, round1, sum } from "@/lib/firestore"
import { Plus, Trash2 } from "lucide-react"

interface Props { uid: string; work: WorkItem[]; screen: ScreenItem[] }

export function ActivityTab({ uid, work, screen }: Props) {
  const [workName, setWorkName] = useState("")
  const [workHrs, setWorkHrs] = useState("")
  const [screenName, setScreenName] = useState("")
  const [screenHrs, setScreenHrs] = useState("")

  async function handleAddWork() {
    if (!workName.trim()) return
    await addWork(uid, { name: workName.trim(), hours: Number(workHrs) || 0, date: today() })
    setWorkName(""); setWorkHrs("")
  }

  async function handleAddScreen() {
    if (!screenName.trim()) return
    await addScreen(uid, { name: screenName.trim(), hours: Number(screenHrs) || 0, date: today() })
    setScreenName(""); setScreenHrs("")
  }

  const workItems = todays(work)
  const screenItems = todays(screen)
  const totalWork = round1(sum(workItems, (x) => x.hours))
  const totalScreen = round1(sum(screenItems, (x) => x.hours))

  return (
    <div className="space-y-6">
      {(workItems.length > 0 || screenItems.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">Total Work</p>
            <p className="text-2xl font-bold text-blue-600">{totalWork} <span className="text-sm font-medium">h</span></p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
            <p className="text-xs font-semibold text-rose-700 mb-1">Screen Time</p>
            <p className="text-2xl font-bold text-rose-500">{totalScreen} <span className="text-sm font-medium">h</span></p>
          </div>
        </div>
      )}

      {/* Work */}
      <div>
        <p className="mb-3 text-sm font-semibold">Work Done</p>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 shadow-sm mb-3">
          <input value={workName} onChange={(e) => setWorkName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddWork()}
            placeholder="What did you work on?"
            className="min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input type="number" value={workHrs} onChange={(e) => setWorkHrs(e.target.value)} placeholder="Hours" min="0" step="0.25"
            className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={handleAddWork}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add work
          </button>
        </div>
        <HrsList items={workItems} onDelete={(id) => deleteWork(uid, id)} emptyMsg="No work logged today" color="text-blue-600" />
      </div>

      {/* Screen time */}
      <div>
        <p className="mb-3 text-sm font-semibold">Screen Time</p>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 shadow-sm mb-3">
          <input value={screenName} onChange={(e) => setScreenName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddScreen()}
            placeholder="App / activity (e.g. Instagram)"
            className="min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input type="number" value={screenHrs} onChange={(e) => setScreenHrs(e.target.value)} placeholder="Hours" min="0" step="0.25"
            className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={handleAddScreen}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add screen time
          </button>
        </div>
        <HrsList items={screenItems} onDelete={(id) => deleteScreen(uid, id)} emptyMsg="No screen time logged today" color="text-rose-500" />
      </div>
    </div>
  )
}

function HrsList({ items, onDelete, emptyMsg, color }: { items: { id: string; name: string; hours: number }[]; onDelete: (id: string) => void; emptyMsg: string; color: string }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {items.map((x) => (
        <div key={x.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="flex-1 text-sm font-medium">{x.name}</p>
          <span className={`font-semibold text-sm whitespace-nowrap ${color}`}>{round1(x.hours)} h</span>
          <button onClick={() => onDelete(x.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
