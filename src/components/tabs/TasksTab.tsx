"use client"

import { useState } from "react"
import { addTask, toggleTask, deleteTask, type Task } from "@/lib/firestore"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props { uid: string; tasks: Task[]; date: string }

const isOverdue = (iso: string) => { const d = new Date(); d.setHours(0,0,0,0); return iso ? new Date(iso + "T00:00:00") < d : false }
const fmtDate = (iso: string) => iso ? new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""

export function TasksTab({ uid, tasks, date }: Props) {
  const [text, setText] = useState("")
  const [due, setDue] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [filter, setFilter] = useState<"all" | "active" | "done">("all")

  async function handleAdd() {
    if (!text.trim()) return
    await addTask(uid, { text: text.trim(), due, priority, done: false, date })
    setText(""); setDue("")
  }

  const dateTasks = tasks.filter((t) => t.date === date)
  const shown = dateTasks.filter((t) => filter === "all" ? true : filter === "active" ? !t.done : t.done)

  return (
    <div className="space-y-4">
      {/* Add task */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What needs doing?"
          className="min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" /> Add task
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5">
        {(["all", "active", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-accent")}>
            {f === "active" ? "To do" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <Empty big={dateTasks.length ? "Nothing here" : "No tasks yet"} sub={dateTasks.length ? "No tasks match this filter." : "Add your first task above."} />
      ) : (
        <div className="space-y-2">
          {shown.map((t) => (
            <div key={t.id} className={cn("flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-opacity", t.done && "opacity-50")}>
              <input type="checkbox" checked={t.done} onChange={(e) => toggleTask(uid, t.id, e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", t.done && "line-through text-muted-foreground")}>{t.text}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <PriorityBadge p={t.priority} />
                  {t.due && <span className={cn("text-xs", !t.done && isOverdue(t.due) ? "font-semibold text-destructive" : "text-muted-foreground")}>due {fmtDate(t.due)}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask(uid, t.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PriorityBadge({ p }: { p: Task["priority"] }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
      p === "high" ? "bg-destructive/10 text-destructive"
      : p === "medium" ? "bg-orange-100 text-orange-600"
      : "bg-emerald-50 text-emerald-700")}>
      {p.toUpperCase()}
    </span>
  )
}

function Empty({ big, sub }: { big: string; sub: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
      <p className="font-medium text-foreground">{big}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}
