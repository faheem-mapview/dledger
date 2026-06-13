"use client"

import { useState } from "react"
import { addFood, deleteFood, type FoodItem, today, todays, sum } from "@/lib/firestore"
import { Plus, Trash2 } from "lucide-react"

interface Props { uid: string; food: FoodItem[] }

export function FoodTab({ uid, food }: Props) {
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [source, setSource] = useState<FoodItem["source"]>("home")

  async function handleAdd() {
    if (!name.trim()) return
    await addFood(uid, { name: name.trim(), calories: Number(calories) || 0, source, date: today() })
    setName(""); setCalories("")
  }

  const items = todays(food)
  const total = sum(items, (x) => x.calories)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Food item (e.g. chicken sandwich)"
          className="min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories" min="0"
          className="w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <select value={source} onChange={(e) => setSource(e.target.value as FoodItem["source"])}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="home">Home</option>
          <option value="hotel">Restaurant</option>
        </select>
        <button onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" /> Add food
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Today&apos;s Total</p>
            <p className="text-xs text-emerald-600">{items.length} items logged</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{total} <span className="text-sm font-medium">kcal</span></p>
        </div>
      )}

      {items.length === 0 ? (
        <Empty big="No food logged today" sub="Add what you eat to track calories." />
      ) : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{f.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold
                  ${f.source === "hotel" ? "bg-orange-100 text-orange-600" : "bg-emerald-50 text-emerald-700"}`}>
                  {f.source === "hotel" ? "EATING OUT" : "HOME"}
                </span>
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">{f.calories} kcal</span>
              <button onClick={() => deleteFood(uid, f.id)}
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
