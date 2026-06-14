"use client"

import { useState } from "react"
import { addExercise, updateExercise, deleteExercise, type ExerciseItem, sum } from "@/lib/firestore"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

interface Props { uid: string; exercise: ExerciseItem[]; date: string }

export function ExerciseTab({ uid, exercise, date }: Props) {
  const [name, setName] = useState("")
  const [minutes, setMinutes] = useState("")
  const [calories, setCalories] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editMin, setEditMin] = useState("")
  const [editCal, setEditCal] = useState("")

  async function handleAdd() {
    if (!name.trim()) return
    await addExercise(uid, { name: name.trim(), minutes: Number(minutes) || 0, calories: Number(calories) || 0, date })
    setName(""); setMinutes(""); setCalories("")
  }

  function startEdit(x: ExerciseItem) {
    setEditId(x.id); setEditName(x.name); setEditMin(String(x.minutes)); setEditCal(String(x.calories))
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return
    await updateExercise(uid, editId, { name: editName.trim(), minutes: Number(editMin) || 0, calories: Number(editCal) || 0 })
    setEditId(null)
  }

  const items = exercise.filter((x) => x.date === date)
  const totalCal = sum(items, (x) => x.calories)
  const totalMin = sum(items, (x) => x.minutes)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Exercise (e.g. morning run)"
          className="min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes" min="0"
          className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories" min="0"
          className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" /> Add exercise
        </button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
            <p className="text-xs font-semibold text-orange-700 mb-1">Calories Burned</p>
            <p className="text-2xl font-bold text-orange-600">{totalCal} <span className="text-sm font-medium">kcal</span></p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">Total Time</p>
            <p className="text-2xl font-bold text-blue-600">{totalMin} <span className="text-sm font-medium">min</span></p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <Empty big="No exercise logged" sub="Add a workout to track calories burned." />
      ) : (
        <div className="space-y-2">
          {items.map((x) => editId === x.id ? (
            <div key={x.id} className="flex flex-wrap gap-2 rounded-xl border border-primary/40 bg-card px-3 py-3 shadow-sm">
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="min-w-[140px] flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input type="number" value={editMin} onChange={(e) => setEditMin(e.target.value)}
                placeholder="min"
                className="w-20 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input type="number" value={editCal} onChange={(e) => setEditCal(e.target.value)}
                placeholder="kcal"
                className="w-20 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex gap-1.5">
                <button onClick={handleSaveEdit}
                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditId(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div key={x.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{x.name}</p>
                {x.minutes > 0 && <p className="text-xs text-muted-foreground mt-0.5">{x.minutes} min</p>}
              </div>
              <span className="font-semibold text-sm text-orange-500 whitespace-nowrap">−{x.calories} kcal</span>
              <button onClick={() => startEdit(x)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteExercise(uid, x.id)}
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

function Empty({ big, sub }: { big: string; sub: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
      <p className="font-medium text-foreground">{big}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}
